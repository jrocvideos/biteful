// ==================== BOUFET IVRS (Vonage Voice) ====================
// Fairmont-grade support: restaurant / customer / driver / concierge
import { Vonage } from '@vonage/server-sdk';
import { createClient } from '@supabase/supabase-js';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VONAGE_NUMBER  = process.env.VONAGE_NUMBER;
const CONCIERGE_NUMBER = process.env.CONCIERGE_NUMBER || "";
const BASE_URL       = process.env.BASE_URL || "https://api.boufet.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

function speak(text, eventUrl = null) {
  const talk = { action: "talk", text, language: "en-US", style: 2 };
  if (!eventUrl) return [talk];
  return [talk, {
    action: "input",
    type: ["dtmf"],
    dtmf: { maxDigits: 1, timeOut: 5 },
    eventUrl: [eventUrl],
  }];
}

function connectConcierge(note = "") {
  const text = note || "One moment. Connecting you to your Boufet concierge.";
  if (!CONCIERGE_NUMBER) {
    return speak("Our concierge team will call you back within 5 minutes. Thank you for your patience.");
  }
  return [
    { action: "talk", text, language: "en-US", style: 2 },
    { action: "connect", from: VONAGE_NUMBER, endpoint: [{ type: "phone", number: CONCIERGE_NUMBER }] },
  ];
}

async function lookupCaller(phone) {
  // Customer with active order?
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", phone)
    .eq("status", "active")
    .maybeSingle();
  if (order) return { persona: "customer", order };

  // Restaurant account?
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("contact_phone", phone)
    .maybeSingle();
  if (restaurant) return { persona: "restaurant", restaurant };

  // Driver account?
  const { data: driver } = await supabase
    .from("drivers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (driver) return { persona: "driver", driver };

  return { persona: "unknown" };
}

async function logCall(caller, persona, intent, { orderId, restaurantId, driverId } = {}) {
  const { data } = await supabase.from("calls").insert({
    caller, persona, intent,
    order_id: orderId || null,
    restaurant_id: restaurantId || null,
    driver_id: driverId || null,
    status: "open",
  }).select("id").single();
  return data?.id;
}

async function resolveCall(callId, resolution) {
  if (!callId) return;
  await supabase.from("calls").update({
    status: "resolved", resolution, resolved_at: new Date().toISOString(),
  }).eq("id", callId);
}

async function escalateCall(callId, reason, hard = false) {
  if (!callId) return;
  await supabase.from("calls").update({
    status: "escalated",
    resolution: `${hard ? "HARD" : "SOFT"}: ${reason}`,
  }).eq("id", callId);
  if (hard) {
    await supabase.from("escalation_queue").insert({
      call_id: callId, reason, priority: "urgent",
    });
  }
}

async function notifyCustomer(orderId, message) {
  const { data: order } = await supabase
    .from("orders").select("customer_phone").eq("id", orderId).single();
  if (!order?.customer_phone) return;
  try {
    await vonage.sms.send({
      to: order.customer_phone,
      from: VONAGE_NUMBER,
      text: message,
    });
  } catch (err) {
    console.error("[IVRS] SMS failed:", err.message);
  }
}

// ── Main menu (Answer URL) ────────────────────────────────────────────────────

app.get("/ivrs/incoming", async (req, res) => {
  const caller = req.query.from || req.query.caller || "unknown";
  const ctx = await lookupCaller(caller).catch(() => ({ persona: "unknown" }));

  let greeting = "Welcome to Boufet. Delivery, elevated.";
  if (ctx.persona === "customer" && ctx.order) {
    const name = ctx.order.customer_name || "";
    greeting = `Welcome back to Boufet${name ? ", " + name : ""}. Delivery, elevated.`;
  } else if (ctx.persona === "restaurant") {
    greeting = `Welcome to Boufet restaurant support${ctx.restaurant?.name ? ", " + ctx.restaurant.name : ""}.`;
  } else if (ctx.persona === "driver") {
    greeting = `Boufet driver support. We're with you${ctx.driver?.name ? ", " + ctx.driver.name : ""}.`;
  }

  const menu =
    "Please choose how we can help. " +
    "Press 1 for restaurant support. " +
    "Press 2 for order status and customer care. " +
    "Press 3 for driver support. " +
    "Press 4 for partnerships. " +
    "Press 0 for your personal concierge.";

  res.json(speak(`${greeting} ${menu}`, `${BASE_URL}/ivrs/dtmf?caller=${caller}`));
});

// ── Main menu digit router ────────────────────────────────────────────────────

app.post("/ivrs/dtmf", async (req, res) => {
  const caller = req.query.caller || req.body?.from || "unknown";
  const digit  = req.body?.dtmf?.digits || "";

  const routes = {
    "1": `${BASE_URL}/ivrs/restaurant?caller=${caller}`,
    "2": `${BASE_URL}/ivrs/customer?caller=${caller}`,
    "3": `${BASE_URL}/ivrs/driver?caller=${caller}`,
    "4": `${BASE_URL}/ivrs/partnership?caller=${caller}`,
    "0": `${BASE_URL}/ivrs/concierge?caller=${caller}`,
  };

  if (!routes[digit]) {
    return res.json(speak("Sorry, I didn't catch that.", `${BASE_URL}/ivrs/incoming?from=${caller}`));
  }

  res.json([{ action: "input", type: ["dtmf"], dtmf: { maxDigits: 1, timeOut: 1 }, eventUrl: [routes[digit]] }]);
});

// ── Restaurant flow ───────────────────────────────────────────────────────────

app.get("/ivrs/restaurant", async (req, res) => {
  const caller = req.query.caller || "unknown";
  const ctx    = await lookupCaller(caller).catch(() => ({}));
  const rid    = ctx.restaurant?.id || null;

  await logCall(caller, "restaurant", "menu_entry", { restaurantId: rid });

  const menu =
    "Restaurant support. We will resolve this quickly. " +
    "Press 1 to correct or change an order. " +
    "Press 2 to add preparation time. " +
    "Press 3 for item unavailable or substitution. " +
    "Press 4 for a driver issue. " +
    "Press 5 for billing or account. " +
    "Press 0 for urgent concierge.";

  res.json(speak(menu, `${BASE_URL}/ivrs/restaurant/action?caller=${caller}&rid=${rid}`));
});

app.post("/ivrs/restaurant/action", async (req, res) => {
  const caller = req.query.caller || "unknown";
  const rid    = req.query.rid || null;
  const digit  = req.body?.dtmf?.digits || "";

  if (digit === "0") {
    const callId = await logCall(caller, "restaurant", "concierge_requested", { restaurantId: rid });
    await escalateCall(callId, "restaurant requested concierge", true);
    return res.json(connectConcierge());
  }

  const intents = {
    "1": ["change_order",     "We are updating your order now. Your customer will be notified."],
    "2": ["delay_order",      "Preparation time extended. We are notifying your customer and adjusting their ETA."],
    "3": ["item_unavailable", "Understood. We will offer your customer a substitution or refund."],
    "4": ["driver_issue",     "We are reassigning a driver to your order now."],
    "5": ["billing",          "Our team will follow up on your billing question within the hour."],
  };

  if (!intents[digit]) {
    return res.json(speak("Invalid option.", `${BASE_URL}/ivrs/incoming?from=${caller}`));
  }

  const [intent, responseText] = intents[digit];
  const callId = await logCall(caller, "restaurant", intent, { restaurantId: rid });

  if (["delay_order", "driver_issue", "item_unavailable"].includes(intent) && rid) {
    const { data: order } = await supabase.from("orders")
      .select("id").eq("restaurant_id", rid).eq("status", "active").maybeSingle();
    if (order?.id) {
      notifyCustomer(order.id, "Update from Boufet: your order has a small delay. We are on it.").catch(() => {});
    }
  }

  await resolveCall(callId, intent);
  res.json(speak(responseText));
});

// ── Customer flow ─────────────────────────────────────────────────────────────

app.get("/ivrs/customer", async (req, res) => {
  const caller = req.query.caller || "unknown";
  const ctx    = await lookupCaller(caller).catch(() => ({}));
  const order  = ctx.order || null;

  let greeting = "Customer care. We will check your order now.";
  if (order) {
    const name       = order.customer_name || "";
    const restaurant = order.restaurant_name || "your restaurant";
    const eta        = order.eta_minutes || "soon";
    greeting = `${name ? name + ", your" : "Your"} order from ${restaurant} is on the way and expected in ${eta} minutes.`;
  }

  const menu =
    `${greeting} ` +
    "Press 1 to track your order. " +
    "Press 2 to change delivery instructions. " +
    "Press 3 for a missing or incorrect item. " +
    "Press 4 for a refund or credit. " +
    "Press 0 to speak with your concierge.";

  res.json(speak(menu, `${BASE_URL}/ivrs/customer/action?caller=${caller}&oid=${order?.id || ""}`));
});

app.post("/ivrs/customer/action", async (req, res) => {
  const caller  = req.query.caller || "unknown";
  const orderId = req.query.oid || null;
  const digit   = req.body?.dtmf?.digits || "";

  if (digit === "0") {
    const callId = await logCall(caller, "customer", "concierge_requested", { orderId });
    await escalateCall(callId, "customer requested concierge", true);
    return res.json(connectConcierge());
  }

  if (digit === "1") {
    let text = "We do not have an active order on file for this number. Please allow a moment for it to process.";
    if (orderId) {
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (order) {
        const eta    = order.eta_minutes || "a few";
        const driver = order.driver_name || "your driver";
        text = `${driver} is on the way. Estimated arrival in ${eta} minutes. We will text you when they are close.`;
      }
    }
    const callId = await logCall(caller, "customer", "order_track", { orderId });
    await resolveCall(callId, "eta_provided");
    return res.json(speak(text));
  }

  const intents = {
    "2": ["change_instructions", "Got it. We will update your delivery instructions now."],
    "3": ["missing_item",        "We are sorry about that. Our team will follow up within the hour with a resolution or credit."],
    "4": ["refund_request",      "Your refund request has been logged. Our team will process it within 24 hours."],
  };

  if (!intents[digit]) {
    return res.json(speak("Invalid option.", `${BASE_URL}/ivrs/incoming?from=${caller}`));
  }

  const [intent, responseText] = intents[digit];
  const callId = await logCall(caller, "customer", intent, { orderId });

  if (["missing_item", "refund_request"].includes(intent)) {
    await escalateCall(callId, `customer reported ${intent}`, false);
  }

  await resolveCall(callId, intent);
  res.json(speak(responseText));
});

// ── Driver flow ───────────────────────────────────────────────────────────────

app.get("/ivrs/driver", async (req, res) => {
  const caller = req.query.caller || "unknown";
  const ctx    = await lookupCaller(caller).catch(() => ({}));
  const driver = ctx.driver || null;
  const name   = driver?.name || "";

  const menu =
    `Driver support. We are with you${name ? ", " + name : ""}. ` +
    "Press 1 for a vehicle problem. " +
    "Press 2 if you cannot locate the customer. " +
    "Press 3 for a restaurant issue. " +
    "Press 4 for a safety concern. " +
    "Press 5 for a payment issue. " +
    "Press 0 for emergency concierge.";

  res.json(speak(menu, `${BASE_URL}/ivrs/driver/action?caller=${caller}&did=${driver?.id || ""}`));
});

app.post("/ivrs/driver/action", async (req, res) => {
  const caller   = req.query.caller || "unknown";
  const driverId = req.query.did || null;
  const digit    = req.body?.dtmf?.digits || "";

  // Safety + emergency — immediate human, no maze
  if (digit === "4" || digit === "0") {
    const intent = digit === "4" ? "safety_concern" : "emergency_concierge";
    const callId = await logCall(caller, "driver", intent, { driverId });
    await escalateCall(callId, intent, true);
    const text = digit === "4"
      ? "Safety is our priority. Connecting you now."
      : "One moment. Connecting you.";
    return res.json(connectConcierge(text));
  }

  if (digit === "2") {
    // Cannot find customer — resend PIN
    const callId = await logCall(caller, "driver", "cannot_find_customer", { driverId });
    if (driverId) {
      const { data: order } = await supabase.from("orders")
        .select("id").eq("driver_id", driverId).eq("status", "active").maybeSingle();
      if (order?.id) {
        notifyCustomer(order.id, "Your Boufet driver needs help finding you. Please check your delivery pin and step outside.").catch(() => {});
      }
    }
    await escalateCall(callId, "driver cannot locate customer", false);
    await resolveCall(callId, "pin_resent");
    return res.json(speak("We have resent the customer their delivery pin and notified them to step outside."));
  }

  const intents = {
    "1": ["vehicle_problem",  "Understood. We are pausing your active delivery and dispatching support. Stay safe."],
    "3": ["restaurant_issue", "We are contacting the restaurant now. You will receive an update in 2 minutes."],
    "5": ["payment_issue",    "Your payment concern has been logged. Our team will resolve it by end of day."],
  };

  if (!intents[digit]) {
    return res.json(speak("Invalid option.", `${BASE_URL}/ivrs/incoming?from=${caller}`));
  }

  const [intent, responseText] = intents[digit];
  const callId = await logCall(caller, "driver", intent, { driverId });
  await resolveCall(callId, intent);
  res.json(speak(responseText));
});

// ── Concierge ─────────────────────────────────────────────────────────────────

app.get("/ivrs/concierge", async (req, res) => {
  const caller = req.query.caller || "unknown";
  const callId = await logCall(caller, "concierge", "direct_request");
  await escalateCall(callId, "caller pressed 0 from main menu", true);
  res.json(connectConcierge());
});

// ── Partnership ───────────────────────────────────────────────────────────────

app.get("/ivrs/partnership", async (req, res) => {
  const caller = req.query.caller || "unknown";
  await logCall(caller, "partnership", "inquiry");
  res.json(speak(
    "Thank you for your interest in partnering with Boufet. " +
    "Please email partnerships at boufet dot com and our team will respond within one business day. " +
    "For urgent inquiries press 0 now.",
    `${BASE_URL}/ivrs/concierge?caller=${caller}`
  ));
});

// ── Vonage events webhook ─────────────────────────────────────────────────────

app.get("/ivrs/events",  (req, res) => res.sendStatus(200));
app.post("/ivrs/events", async (req, res) => {
  const { status, type, uuid, duration } = req.body || {};
  console.log("[IVRS] Event:", status || type, "uuid:", uuid);
  await supabase.from("voice_logs").insert({
    vonage_uuid: uuid || null,
    event_type:  status || type || "unknown",
    duration_sec: duration ? parseInt(duration) : null,
  }).catch(() => {});
  res.sendStatus(200);
});

// ── Outbound: call restaurant when new order arrives ──────────────────────────

export async function callRestaurant(restaurantPhone, orderDetails) {
  try {
    await vonage.voice.createOutboundCall({
      to: [{ type: "phone", number: restaurantPhone }],
      from: { type: "phone", number: VONAGE_NUMBER },
      ncco: [
        { action: "talk", text: `New Boufet order received. ${orderDetails}. Press 1 to confirm or press 2 to decline.`, language: "en-US", style: 2 },
        { action: "input", type: ["dtmf"], dtmf: { maxDigits: 1, timeOut: 10 }, eventUrl: [`${BASE_URL}/ivrs/restaurant-response`] },
      ],
    });
    console.log("[IVRS] Called restaurant:", restaurantPhone);
  } catch (err) {
    console.error("[IVRS] Restaurant call failed:", err.message);
  }
}

app.post("/ivrs/restaurant-response", (req, res) => {
  const digit = req.body?.dtmf?.digits;
  const text  = digit === "1"
    ? "Order confirmed. Thank you. Please prepare the order promptly."
    : "Order declined. We will notify the customer. Thank you.";
  res.json([{ action: "talk", text, language: "en-US", style: 2 }]);
});

// ── Outbound: call driver when job is available ───────────────────────────────

export async function callDriver(driverPhone, jobDetails) {
  try {
    await vonage.voice.createOutboundCall({
      to: [{ type: "phone", number: driverPhone }],
      from: { type: "phone", number: VONAGE_NUMBER },
      ncco: [
        { action: "talk", text: `New Boufet delivery available. ${jobDetails}. Press 1 to accept or press 2 to decline.`, language: "en-US", style: 2 },
        { action: "input", type: ["dtmf"], dtmf: { maxDigits: 1, timeOut: 10 }, eventUrl: [`${BASE_URL}/ivrs/driver-response`] },
      ],
    });
    console.log("[IVRS] Called driver:", driverPhone);
  } catch (err) {
    console.error("[IVRS] Driver call failed:", err.message);
  }
}

app.post("/ivrs/driver-response", (req, res) => {
  const digit = req.body?.dtmf?.digits;
  const text  = digit === "1"
    ? "Job accepted. Please head to the restaurant now. Drive safe."
    : "Job declined. We will find another driver. Thank you.";
  res.json([{ action: "talk", text, language: "en-US", style: 2 }]);
});
