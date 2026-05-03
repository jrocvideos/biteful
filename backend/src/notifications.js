import { Vonage } from '@vonage/server-sdk';
import { createClient } from '@supabase/supabase-js';

const vonage = new Vonage({ apiKey: process.env.VONAGE_API_KEY, apiSecret: process.env.VONAGE_API_SECRET });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const VONAGE_NUMBER = process.env.VONAGE_NUMBER;
const FROM_EMAIL = process.env.FROM_EMAIL || "support@boufet.com";

async function logNotification(callId, type, recipient, message, status = "sent") {
  await supabase.from("notifications").insert({ call_id: callId || null, type, recipient, message, status }).catch(() => {});
}

export async function sendSMS(to, message, callId = null) {
  try {
    await vonage.sms.send({ to, from: VONAGE_NUMBER, text: message });
    await logNotification(callId, "sms", to, message, "sent");
  } catch (err) {
    await logNotification(callId, "sms", to, message, "failed");
    console.error(`[NOTIFY] SMS failed:`, err.message);
  }
}

export async function callBack(to, message, callId = null) {
  try {
    await vonage.voice.createOutboundCall({
      to: [{ type: "phone", number: to }],
      from: { type: "phone", number: VONAGE_NUMBER },
      ncco: [{ action: "talk", text: message, language: "en-US", style: 2 }],
    });
    await logNotification(callId, "call", to, message, "sent");
    console.log(`[NOTIFY] Called ${to}`);
  } catch (err) {
    await logNotification(callId, "call", to, message, "failed");
    console.error(`[NOTIFY] Call failed:`, err.message);
  }
}

export async function dispatchNotification(callId, persona, intent, { orderId, restaurantId, driverId, callerPhone } = {}) {

  if (persona === "driver") {
    if (intent === "vehicle_problem") {
      await callBack(callerPhone, "This is Boufet support following up on your vehicle issue. A team member will assist you shortly. Stay safe.", callId);
    }
    if (intent === "restaurant_issue") {
      const { data: order } = await supabase.from("orders").select("restaurant_id").eq("driver_id", driverId).eq("status", "active").maybeSingle();
      if (order?.restaurant_id) {
        const { data: rest } = await supabase.from("restaurants").select("contact_phone, name").eq("id", order.restaurant_id).single();
        if (rest?.contact_phone) await callBack(rest.contact_phone, "This is Boufet. Your driver has reported an issue at your restaurant for an active order. Please check with your team.", callId);
      }
    }
    if (intent === "payment_issue") {
      await sendSMS(callerPhone, "Boufet: Your payment issue has been logged. Our team will resolve it by end of day. Thank you.", callId);
    }
  }

  if (persona === "customer") {
    if (intent === "missing_item") {
      await sendSMS(callerPhone, "Boufet: We are sorry about your missing item. Our team will follow up within the hour with a resolution or credit.", callId);
    }
    if (intent === "refund_request") {
      await sendSMS(callerPhone, "Boufet: Your refund request has been received. We will process it within 24 hours. Thank you.", callId);
    }
    if (intent === "change_instructions" && orderId) {
      const { data: order } = await supabase.from("orders").select("driver_id").eq("id", orderId).single();
      if (order?.driver_id) {
        const { data: driver } = await supabase.from("drivers").select("phone").eq("id", order.driver_id).single();
        if (driver?.phone) await callBack(driver.phone, "This is Boufet. The customer has updated their delivery instructions. Please check the app for the latest details.", callId);
      }
    }
  }

  if (persona === "restaurant") {
    if (intent === "delay_order" && orderId) {
      const { data: order } = await supabase.from("orders").select("customer_phone, restaurant_name").eq("id", orderId).single();
      if (order?.customer_phone) await sendSMS(order.customer_phone, `Boufet update: Your order from ${order.restaurant_name || "your restaurant"} is running a little late. We are on it.`, callId);
    }
    if (intent === "driver_issue") {
      await sendSMS(callerPhone, "Boufet: We are reassigning a driver to your order now. You will receive an update shortly.", callId);
    }
  }
}
