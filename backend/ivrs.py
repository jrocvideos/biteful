"""
Boufet IVRS — FastAPI backend
Vonage webhooks → routing logic → Supabase logging → escalation queue
"""

from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from datetime import datetime, timezone
from supabase import create_client, Client
import logging

logger = logging.getLogger("boufet.ivrs")

app = FastAPI(title="Boufet IVRS")

# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Vonage ────────────────────────────────────────────────────────────────────
VONAGE_API_KEY    = os.environ["VONAGE_API_KEY"]
VONAGE_API_SECRET = os.environ["VONAGE_API_SECRET"]
VONAGE_APP_ID     = os.environ["VONAGE_APP_ID"]
VONAGE_NUMBER     = os.environ["VONAGE_NUMBER"]          # +12046500506
CONCIERGE_NUMBER  = os.environ["CONCIERGE_NUMBER"]       # your ops team phone

BASE_URL = os.environ["BASE_URL"]                        # https://api.boufet.com


# ══════════════════════════════════════════════════════════════════════════════
# NCCO BUILDERS
# ══════════════════════════════════════════════════════════════════════════════

def ncco_speak(text: str, next_url: str = None) -> list:
    action = {"action": "talk", "text": text, "language": "en-US", "style": 2}
    if next_url:
        return [action, {"action": "input", "type": ["dtmf"], "dtmf": {"maxDigits": 1, "timeOut": 5}, "eventUrl": [next_url]}]
    return [action]


def ncco_connect_concierge(call_uuid: str) -> list:
    """Bridge caller to live concierge — the Fairmont moment."""
    return [
        {"action": "talk", "text": "One moment. Connecting you to your Boufet concierge.", "language": "en-US", "style": 2},
        {"action": "connect", "from": VONAGE_NUMBER, "endpoint": [{"type": "phone", "number": CONCIERGE_NUMBER}]},
    ]


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


async def lookup_caller(phone: str) -> dict:
    """Return caller context: order, restaurant, driver, or unknown."""
    # Check active customer order
    order = supabase.table("orders").select("*").eq("customer_phone", phone).eq("status", "active").maybe_single().execute()
    if order.data:
        return {"persona": "customer", "order": order.data}

    # Check restaurant account
    restaurant = supabase.table("restaurants").select("*").eq("contact_phone", phone).maybe_single().execute()
    if restaurant.data:
        return {"persona": "restaurant", "restaurant": restaurant.data}

    # Check driver account
    driver = supabase.table("drivers").select("*").eq("phone", phone).maybe_single().execute()
    if driver.data:
        return {"persona": "driver", "driver": driver.data}

    return {"persona": "unknown"}


def log_call(caller: str, persona: str, intent: str, order_id=None, restaurant_id=None, driver_id=None) -> str:
    """Insert call record. Returns call_id."""
    row = {
        "caller": caller,
        "persona": persona,
        "intent": intent,
        "order_id": order_id,
        "restaurant_id": restaurant_id,
        "driver_id": driver_id,
        "status": "open",
        "created_at": now_utc(),
    }
    result = supabase.table("calls").insert(row).execute()
    return result.data[0]["id"]


def resolve_call(call_id: str, resolution: str):
    supabase.table("calls").update({
        "status": "resolved",
        "resolution": resolution,
        "resolved_at": now_utc(),
    }).eq("id", call_id).execute()


def escalate_call(call_id: str, reason: str, hard: bool = False):
    supabase.table("calls").update({
        "status": "escalated",
        "resolution": f"{'HARD' if hard else 'SOFT'}: {reason}",
    }).eq("id", call_id).execute()

    if hard:
        # Push to escalation_queue table for ops dashboard
        supabase.table("escalation_queue").insert({
            "call_id": call_id,
            "reason": reason,
            "priority": "urgent" if hard else "normal",
            "created_at": now_utc(),
        }).execute()


async def notify_customer(order_id: str, message: str):
    """Send SMS to customer via Vonage Messages API."""
    order = supabase.table("orders").select("customer_phone, customer_name").eq("id", order_id).single().execute()
    if not order.data:
        return
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.nexmo.com/v1/messages",
            auth=(VONAGE_API_KEY, VONAGE_API_SECRET),
            json={
                "from": {"type": "sms", "number": VONAGE_NUMBER},
                "to": {"type": "sms", "number": order.data["customer_phone"]},
                "message": {"content": {"type": "text", "text": message}},
            },
        )


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/ivrs/incoming")
async def ivrs_incoming(request: Request):
    """
    Vonage Answer URL — first thing called when someone dials in.
    Personalize greeting by caller ID. Return NCCO main menu.
    """
    params = dict(request.query_params)
    caller = params.get("from", "unknown")

    ctx = await lookup_caller(caller)
    persona = ctx["persona"]

    if persona == "customer" and ctx.get("order"):
        name = ctx["order"].get("customer_name", "there")
        greeting = f"Welcome back to Boufet, {name}. Delivery, elevated."
    elif persona == "restaurant":
        name = ctx["restaurant"].get("name", "")
        greeting = f"Welcome to Boufet restaurant support{', ' + name if name else ''}."
    elif persona == "driver":
        name = ctx["driver"].get("name", "")
        greeting = f"Boufet driver support. We're with you{', ' + name if name else ''}."
    else:
        greeting = "Welcome to Boufet. Delivery, elevated."

    menu = (
        "Please choose how we can help. "
        "Press 1 for restaurant support. "
        "Press 2 for order status and customer care. "
        "Press 3 for driver support. "
        "Press 4 for partnerships and business. "
        "Press 0 for your personal concierge."
    )

    ncco = ncco_speak(
        f"{greeting} {menu}",
        next_url=f"{BASE_URL}/ivrs/dtmf?caller={caller}"
    )
    return JSONResponse(content=ncco)


@app.post("/ivrs/dtmf")
async def ivrs_dtmf(request: Request):
    """Route digit press from main menu to persona endpoint."""
    body = await request.json()
    caller = request.query_params.get("caller", body.get("from", "unknown"))
    digit = body.get("dtmf", {}).get("digits", "")

    routes = {
        "1": f"{BASE_URL}/ivrs/restaurant?caller={caller}",
        "2": f"{BASE_URL}/ivrs/customer?caller={caller}",
        "3": f"{BASE_URL}/ivrs/driver?caller={caller}",
        "4": f"{BASE_URL}/ivrs/partnership?caller={caller}",
        "0": f"{BASE_URL}/ivrs/concierge?caller={caller}",
    }

    if digit not in routes:
        ncco = ncco_speak(
            "Sorry, I didn't catch that.",
            next_url=f"{BASE_URL}/ivrs/incoming?from={caller}"
        )
        return JSONResponse(content=ncco)

    # Redirect to persona handler via NCCO input redirect
    return JSONResponse(content=[{
        "action": "input",
        "type": ["dtmf"],
        "dtmf": {"maxDigits": 1, "timeOut": 1},
        "eventUrl": [routes[digit]],
    }])


# ─── Restaurant ───────────────────────────────────────────────────────────────

@app.get("/ivrs/restaurant")
async def ivrs_restaurant(request: Request, background_tasks: BackgroundTasks):
    caller = request.query_params.get("caller", "unknown")
    ctx = await lookup_caller(caller)
    restaurant = ctx.get("restaurant", {})
    restaurant_id = restaurant.get("id")

    log_call(caller, "restaurant", "menu_entry", restaurant_id=restaurant_id)

    menu = (
        "Restaurant support. We'll resolve this quickly. "
        "Press 1 to correct or change an order. "
        "Press 2 to add preparation time. "
        "Press 3 for item unavailable or substitution. "
        "Press 4 for a driver issue. "
        "Press 5 for billing or account. "
        "Press 0 for urgent concierge."
    )
    ncco = ncco_speak(menu, next_url=f"{BASE_URL}/ivrs/restaurant/action?caller={caller}&rid={restaurant_id}")
    return JSONResponse(content=ncco)


@app.post("/ivrs/restaurant/action")
async def ivrs_restaurant_action(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    caller = request.query_params.get("caller", "unknown")
    restaurant_id = request.query_params.get("rid")
    digit = body.get("dtmf", {}).get("digits", "")

    intents = {
        "1": ("change_order",    "We're updating your order now. Your customer will be notified."),
        "2": ("delay_order",     "Preparation time extended. We're notifying your customer and adjusting their ETA."),
        "3": ("item_unavailable","Understood. We'll offer your customer a substitution or refund."),
        "4": ("driver_issue",    "We're reassigning a driver to your order now."),
        "5": ("billing",         "Our team will follow up on your billing question within the hour."),
        "0": ("concierge",       None),
    }

    if digit not in intents:
        return JSONResponse(content=ncco_speak("Invalid option. Returning to main menu.", f"{BASE_URL}/ivrs/incoming?from={caller}"))

    intent, response_text = intents[digit]

    if digit == "0":
        call_id = log_call(caller, "restaurant", "concierge_requested", restaurant_id=restaurant_id)
        escalate_call(call_id, "restaurant requested concierge", hard=True)
        return JSONResponse(content=ncco_connect_concierge(call_id))

    call_id = log_call(caller, "restaurant", intent, restaurant_id=restaurant_id)

    # Trigger ops actions in background
    if intent in ("delay_order", "driver_issue", "item_unavailable"):
        # Find active order for this restaurant and notify customer
        order = supabase.table("orders").select("*").eq("restaurant_id", restaurant_id).eq("status", "active").maybe_single().execute()
        if order.data:
            background_tasks.add_task(notify_customer, order.data["id"], f"Update from Boufet: your order has a small delay. We're on it.")

    resolve_call(call_id, intent)
    return JSONResponse(content=ncco_speak(response_text))


# ─── Customer ────────────────────────────────────────────────────────────────

@app.get("/ivrs/customer")
async def ivrs_customer(request: Request):
    caller = request.query_params.get("caller", "unknown")
    ctx = await lookup_caller(caller)
    order = ctx.get("order", {})

    if order:
        name = order.get("customer_name", "")
        restaurant = order.get("restaurant_name", "your restaurant")
        eta = order.get("eta_minutes", "soon")
        greeting = f"{name + ', your' if name else 'Your'} order from {restaurant} is on the way and expected in {eta} minutes."
    else:
        greeting = "Customer care. We'll check your order now."

    menu = (
        f"{greeting} "
        "Press 1 to track your order. "
        "Press 2 to change delivery instructions. "
        "Press 3 for a missing or incorrect item. "
        "Press 4 for a refund or credit. "
        "Press 0 to speak with your concierge."
    )

    order_id = order.get("id", "")
    ncco = ncco_speak(menu, next_url=f"{BASE_URL}/ivrs/customer/action?caller={caller}&oid={order_id}")
    return JSONResponse(content=ncco)


@app.post("/ivrs/customer/action")
async def ivrs_customer_action(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    caller = request.query_params.get("caller", "unknown")
    order_id = request.query_params.get("oid")
    digit = body.get("dtmf", {}).get("digits", "")

    if digit == "0":
        call_id = log_call(caller, "customer", "concierge_requested", order_id=order_id)
        escalate_call(call_id, "customer requested concierge", hard=True)
        return JSONResponse(content=ncco_connect_concierge(call_id))

    if digit == "1":
        # Real-time order status — the premium moment
        if order_id:
            order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
            if order.data:
                eta = order.data.get("eta_minutes", "a few")
                driver = order.data.get("driver_name", "your driver")
                text = f"{driver} is on the way. Estimated arrival in {eta} minutes. We'll text you when they're close."
            else:
                text = "We're locating your order now. You'll receive a text update shortly."
        else:
            text = "We don't have an active order on file for this number. If you placed an order recently, please allow a moment for it to process."
        call_id = log_call(caller, "customer", "order_track", order_id=order_id)
        resolve_call(call_id, "eta_provided")
        return JSONResponse(content=ncco_speak(text))

    intents = {
        "2": ("change_instructions", "Got it. Please stay on the line and we'll update your delivery instructions."),
        "3": ("missing_item",        "We're sorry about that. Our team will follow up within the hour with a resolution or credit."),
        "4": ("refund_request",      "Your refund request has been logged. Our team will process it within 24 hours."),
    }

    if digit not in intents:
        return JSONResponse(content=ncco_speak("Invalid option.", f"{BASE_URL}/ivrs/incoming?from={caller}"))

    intent, response_text = intents[digit]
    call_id = log_call(caller, "customer", intent, order_id=order_id)

    if intent in ("missing_item", "refund_request"):
        escalate_call(call_id, f"customer reported {intent}", hard=False)

    resolve_call(call_id, intent)
    return JSONResponse(content=ncco_speak(response_text))


# ─── Driver ──────────────────────────────────────────────────────────────────

@app.get("/ivrs/driver")
async def ivrs_driver(request: Request):
    caller = request.query_params.get("caller", "unknown")
    ctx = await lookup_caller(caller)
    driver = ctx.get("driver", {})
    name = driver.get("name", "")

    greeting = f"Driver support. We're with you{', ' + name if name else ''}."
    menu = (
        f"{greeting} "
        "Press 1 for a vehicle problem. "
        "Press 2 if you cannot locate the customer. "
        "Press 3 for a restaurant issue. "
        "Press 4 for a safety concern. "
        "Press 5 for a payment issue. "
        "Press 0 for emergency concierge."
    )

    driver_id = driver.get("id", "")
    ncco = ncco_speak(menu, next_url=f"{BASE_URL}/ivrs/driver/action?caller={caller}&did={driver_id}")
    return JSONResponse(content=ncco)


@app.post("/ivrs/driver/action")
async def ivrs_driver_action(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    caller = request.query_params.get("caller", "unknown")
    driver_id = request.query_params.get("did")
    digit = body.get("dtmf", {}).get("digits", "")

    # Safety and emergency — NO menu maze, immediate human
    if digit in ("4", "0"):
        intent = "safety_concern" if digit == "4" else "emergency_concierge"
        call_id = log_call(caller, "driver", intent, driver_id=driver_id)
        escalate_call(call_id, intent, hard=True)
        speak = "Safety is our priority. Connecting you now." if digit == "4" else "One moment. Connecting you."
        return JSONResponse(content=[
            {"action": "talk", "text": speak, "language": "en-US", "style": 2},
            {"action": "connect", "from": VONAGE_NUMBER, "endpoint": [{"type": "phone", "number": CONCIERGE_NUMBER}]},
        ])

    intents = {
        "1": ("vehicle_problem",       "Understood. We're pausing your active delivery and dispatching support. Stay safe."),
        "2": ("cannot_find_customer",  None),   # special: resend PIN + connect
        "3": ("restaurant_issue",      "We're contacting the restaurant now. You'll receive an update in 2 minutes."),
        "5": ("payment_issue",         "Your payment concern has been logged. Our team will resolve it by end of day."),
    }

    if digit not in intents:
        return JSONResponse(content=ncco_speak("Invalid option.", f"{BASE_URL}/ivrs/incoming?from={caller}"))

    intent, response_text = intents[digit]
    call_id = log_call(caller, "driver", intent, driver_id=driver_id)

    if digit == "2":
        # Resend customer PIN and offer call bridge
        order = supabase.table("orders").select("*").eq("driver_id", driver_id).eq("status", "active").maybe_single().execute()
        if order.data:
            background_tasks.add_task(notify_customer, order.data["id"], "Your Boufet driver needs help finding you. Please check your delivery pin and location.")
        response_text = "We've resent the customer their delivery pin and notified them. Would you like us to connect you directly? Press 1 to connect, or hang up if resolved."
        escalate_call(call_id, "driver cannot locate customer", hard=False)

    resolve_call(call_id, intent)
    return JSONResponse(content=ncco_speak(response_text))


# ─── Concierge ───────────────────────────────────────────────────────────────

@app.get("/ivrs/concierge")
async def ivrs_concierge(request: Request):
    caller = request.query_params.get("caller", "unknown")
    call_id = log_call(caller, "concierge", "direct_request")
    escalate_call(call_id, "caller pressed 0 from main menu", hard=True)
    return JSONResponse(content=ncco_connect_concierge(call_id))


# ─── Partnership ─────────────────────────────────────────────────────────────

@app.get("/ivrs/partnership")
async def ivrs_partnership(request: Request):
    caller = request.query_params.get("caller", "unknown")
    log_call(caller, "partnership", "inquiry")
    return JSONResponse(content=ncco_speak(
        "Thank you for your interest in partnering with Boufet. "
        "Please email partnerships at boufet dot com and our team will respond within one business day. "
        "For urgent inquiries, press 0 now."
    ))


# ══════════════════════════════════════════════════════════════════════════════
# VONAGE EVENTS WEBHOOK — keep clean, no business logic
# ══════════════════════════════════════════════════════════════════════════════

@app.api_route("/ivrs/events", methods=["GET", "POST"])
async def ivrs_events(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = dict(request.query_params)

    event_type  = body.get("status") or body.get("type", "unknown")
    vonage_uuid = body.get("uuid", "")
    duration    = body.get("duration")

    logger.info(f"Vonage event: {event_type} uuid={vonage_uuid}")

    supabase.table("voice_logs").insert({
        "vonage_uuid": vonage_uuid,
        "event_type":  event_type,
        "duration_sec": int(duration) if duration else None,
        "created_at":  now_utc(),
    }).execute()

    return JSONResponse(content={"ok": True})
