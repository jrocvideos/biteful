import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const { Pool } = pkg;
const app = express();
export { app, pool, io };
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NOTIFY_EMAIL_1 || "friendlyconcierge@protonmail.com",
    pass: process.env.EMAIL_APP_PASSWORD || "",
  },
});

const sendRestaurantAlert = async (data) => {
  const msg = {
    from: process.env.NOTIFY_EMAIL_1 || "friendlyconcierge@protonmail.com",
    to: ["friendlyconcierge@protonmail.com", "yolandacantusa@gmail.com"].join(","),
    subject: `🍽️ New Restaurant Application — ${data.restaurantName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0d9488;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">New Restaurant Partner Application</h1>
          <p style="color:#ccfbf1;margin:8px 0 0">Boufet — Action Required</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Restaurant Name</td><td style="padding:8px 0;font-weight:bold">${data.restaurantName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Owner Name</td><td style="padding:8px 0;font-weight:bold">${data.ownerName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Phone</td><td style="padding:8px 0"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Address</td><td style="padding:8px 0">${data.address}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Cuisine</td><td style="padding:8px 0">${data.cuisine}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Avg Monthly Orders</td><td style="padding:8px 0">${data.avgMonthlyOrders}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Message</td><td style="padding:8px 0">${data.message || "None"}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#ccfbf1;border-radius:8px;border-left:4px solid #0d9488">
            <p style="margin:0;font-weight:bold;color:#0d9488">Action Required</p>
            <p style="margin:8px 0 0;color:#374151;font-size:14px">Call or email this restaurant within 24 hours to confirm their application and get them onboarded.</p>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center">Boufet — boufet.com</p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(msg);
    console.log("Restaurant alert sent to team");
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/biteful",
  max: 20,                // max 20 connections in pool
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 2000, // fail fast if no connection available
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "biteful-secret");
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ==================== AUTH ====================
app.post("/api/auth/register", async (req, res) => {
  const { email, password, phone, first_name, last_name, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (id, email, password_hash, phone, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role",
      [uuidv4(), email, hash, phone, first_name, last_name, role || "customer"]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email, role: user.role }, process.env.JWT_SECRET || "biteful-secret");
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });
    const token = jwt.sign({ id: user.id, email, role: user.role }, process.env.JWT_SECRET || "biteful-secret");
    res.json({ token, user: { id: user.id, email, role: user.role, first_name: user.first_name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== RESTAURANTS ====================
app.get("/api/restaurants", async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;
  try {
    let query = "SELECT * FROM restaurants WHERE is_active = true AND is_open = true";
    let params = [];
    if (lat && lng) {
      query += " AND (6371 * acos(cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2)) + sin(radians($1)) * sin(radians(lat)))) < $3";
      params = [lat, lng, radius];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/restaurants/:id/menu", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = true", [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ORDERS ====================
app.post("/api/orders", auth, async (req, res) => {
  const { restaurant_id, items, tip = 0, customer_address, customer_lat, customer_lng, special_instructions } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Get menu prices
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuResult = await client.query("SELECT price FROM menu_items WHERE id = $1", [item.menu_item_id]);
      if (menuResult.rows.length === 0) throw new Error("Menu item not found");
      const price = menuResult.rows[0].price;
      subtotal += price * item.quantity;
      orderItems.push({ ...item, unit_price: price });
    }
    
    const tax = subtotal * 0.08;
    const delivery_fee = 2.99;
    const service_fee = 3.50;
    const total = subtotal + tax + delivery_fee + service_fee + tip;
    
    // Get restaurant commission rate
    const restResult = await client.query("SELECT commission_rate FROM restaurants WHERE id = $1", [restaurant_id]);
    const commission = restResult.rows[0]?.commission_rate || 20.00;
    const commission_amount = subtotal * (commission / 100);
    
    // Driver pay calculation
    const driver_base = 2.50;
    const tip_skim = tip > 0 ? 2.50 : 0; // Operating fund: ads, infrastructure, growth
    const driver_total = driver_base + (tip - tip_skim);
    const boufet_net = total - driver_total - commission_amount;
    
    const orderId = uuidv4();
    await client.query(
      `INSERT INTO orders (id, user_id, restaurant_id, subtotal, tax, delivery_fee, service_fee, tip, total, driver_base_pay, driver_total_pay, commission_amount, boufet_net, status, customer_address, customer_lat, customer_lng, special_instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [orderId, req.user.id, restaurant_id, subtotal, tax, delivery_fee, service_fee, tip, total,
       driver_base, driver_total, commission_amount, boufet_net, "pending_payment", customer_address, customer_lat, customer_lng, special_instructions]
    );
    
    for (const item of orderItems) {
      await client.query(
        "INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)",
        [uuidv4(), orderId, item.menu_item_id, item.quantity, item.unit_price, item.special_instructions || null]
      );
    }
    
    await client.query("COMMIT");
    res.json({ order_id: orderId, total, status: "pending_payment" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Stripe payment intent
app.post("/api/orders/:id/pay", auth, async (req, res) => {
  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    const order = orderResult.rows[0];
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "usd",
      metadata: { order_id: order.id },
    });
    
    await pool.query("INSERT INTO payments (id, order_id, stripe_payment_intent_id, amount, status) VALUES ($1, $2, $3, $4, $5)",
      [uuidv4(), order.id, paymentIntent.id, order.total, "pending"]);
    
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm payment & notify restaurant
app.post("/api/orders/:id/confirm-payment", auth, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = 'paid' WHERE id = $1", [req.params.id]);
    // Notify restaurant via WebSocket
    io.emit("new_order", { type: "new_order", order_id: req.params.id });
    res.json({ status: "paid" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurant accepts order
app.post("/api/orders/:id/accept", auth, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = 'confirmed', accepted_at = NOW() WHERE id = $1", [req.params.id]);
    io.emit("order_update", { status: "confirmed" });
    res.json({ status: "confirmed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurant marks ready
app.post("/api/orders/:id/ready", auth, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = 'ready_for_pickup' WHERE id = $1", [req.params.id]);
    // Trigger driver matching
    matchDriver(req.params.id);
    res.json({ status: "ready_for_pickup" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DRIVER MATCHING ====================
async function matchDriver(orderId) {
  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    const order = orderResult.rows[0];
    
    const restResult = await pool.query("SELECT lat, lng FROM restaurants WHERE id = $1", [order.restaurant_id]);
    const restaurant = restResult.rows[0];
    
    // Find nearest online driver not on delivery
    const driverResult = await pool.query(
      "SELECT u.id as driver_id, d.lat, d.lng FROM users u JOIN driver_locations d ON u.id = d.driver_id WHERE u.role = 'driver' AND u.is_online = true AND u.on_delivery = false ORDER BY point(d.lng, d.lat) <-> point($2, $1) LIMIT 1",
      [restaurant.lat, restaurant.lng]
    );
    
    if (driverResult.rows.length > 0) {
      const driver = driverResult.rows[0];
      await pool.query("UPDATE orders SET driver_id = $1, status = 'driver_assigned' WHERE id = $2", [driver.driver_id, orderId]);
      await pool.query("UPDATE driver_locations SET is_on_delivery = true WHERE driver_id = $1", [driver.driver_id]);
      io.emit("driver_update", { type: "new_job", order_id: orderId });
      io.emit("order_update", { status: "driver_assigned", driver_id: driver.driver_id });
    }
  } catch (err) {
    console.error("Match driver error:", err);
  }
}

// Driver accepts job
app.post("/api/orders/:id/driver-accept", auth, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = 'driver_en_route' WHERE id = $1", [req.params.id]);
    io.emit("order_update", { status: "driver_en_route" });
    res.json({ status: "driver_en_route" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver location update
app.post("/api/drivers/location", auth, async (req, res) => {
  const { lat, lng, is_online } = req.body;
  try {
    await pool.query(
      "INSERT INTO driver_locations (driver_id, lat, lng, is_online, updated_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (driver_id) DO UPDATE SET lat=$2, lng=$3, is_online=$4, updated_at=NOW()",
      [req.user.id, lat, lng, is_online]
    );
    
    // Check if driver has active order
    const orderResult = await pool.query("SELECT id FROM orders WHERE driver_id =  AND status IN ('driver_en_route','picked_up','en_route_to_customer')", [req.user.id]);
    if (orderResult.rows.length > 0) {
      const orderId = orderResult.rows[0].id;
      await pool.query("UPDATE orders SET driver_lat = $1, driver_lng = $2 WHERE id = $3", [lat, lng, orderId]);
      io.emit("driver_location", { lat, lng });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver status updates
app.post("/api/orders/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['driver_at_restaurant','picked_up','en_route_to_customer','arrived','delivered'];
  
  try {
    let query = "UPDATE orders SET status = ";
    const params = [status];
    if (status === 'picked_up') query += ", picked_up_at = NOW()";
    if (status === 'delivered') query += ", delivered_at = NOW()";
    query += " WHERE id = $" + (params.length + 1);
    params.push(req.params.id);
    
    await pool.query(query, params);
    
    if (status === 'delivered') {
      await pool.query("UPDATE driver_locations SET is_on_delivery = false WHERE driver_id = (SELECT driver_id FROM orders WHERE id = $1)", [req.params.id]);
    }
    
    io.emit("order_update", { status });
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TRACKING ====================
app.get("/api/orders/:id/track", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT o.*, u.first_name as driver_first_name, d.lat as driver_lat, d.lng as driver_lng FROM orders o LEFT JOIN users u ON o.driver_id = u.id LEFT JOIN driver_locations d ON o.driver_id = d.driver_id WHERE o.id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DRIVER DASHBOARD ====================
app.get("/api/drivers/earnings", auth, async (req, res) => {
  try {
    const todayResult = await pool.query(
      "SELECT COALESCE(SUM(driver_total),0) as earnings, COUNT(*) as trips FROM orders WHERE driver_id =  AND delivered_at >= CURRENT_DATE",
      [req.user.id]
    );
    const weekResult = await pool.query(
      "SELECT COALESCE(SUM(driver_total),0) as earnings, COUNT(*) as trips FROM orders WHERE driver_id =  AND delivered_at >= CURRENT_DATE - INTERVAL '7 days'",
      [req.user.id]
    );
    res.json({
      today: todayResult.rows[0],
      week: weekResult.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== LIVE STATS ====================
app.get("/api/stats", async (req, res) => {
  try {
    const [orders, drivers, restaurants] = await Promise.all([
      pool.query("SELECT status, total FROM orders WHERE created_at > NOW() - INTERVAL '24 hours'"),
      pool.query("SELECT COUNT(*) as count FROM drivers WHERE is_online = true"),
      pool.query("SELECT COUNT(*) as count FROM restaurants WHERE is_active = true"),
    ]);

    const todayOrders = orders.rows;
    const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const ordersActive = todayOrders.filter(o => ['confirmed','preparing'].includes(o.status)).length;
    const ordersReady = todayOrders.filter(o => o.status === 'ready_for_pickup').length;

    res.json({
      total_orders: todayOrders.length,
      today_revenue: todayRevenue,
      active_drivers: parseInt(drivers.rows[0]?.count || 0),
      restaurants_signed: parseInt(restaurants.rows[0]?.count || 0),
      orders_active: ordersActive,
      orders_ready: ordersReady,
    });
  } catch (err) {
    // Return mock data if DB tables don't exist yet
    res.json({
      total_orders: 42,
      today_revenue: 1847.50,
      active_drivers: 3,
      restaurants_signed: 3,
      orders_active: 2,
      orders_ready: 1,
    });
  }
});

// ==================== RESTAURANT SIGNUP ====================
app.post("/api/restaurant/apply", async (req, res) => {
  const { restaurantName, ownerName, email, phone, address, cuisine, avgMonthlyOrders, message } = req.body;
  try {
    // Save to DB
    await pool.query(
      "INSERT INTO restaurant_applications (id, restaurant_name, owner_name, email, phone, address, cuisine, avg_monthly_orders, message, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',NOW()) ON CONFLICT DO NOTHING",
      [uuidv4(), restaurantName, ownerName, email, phone, address, cuisine, avgMonthlyOrders || 0, message || ""]
    ).catch(() => {}); // Table may not exist yet, dont block

    // Send email notification
    await sendRestaurantAlert({ restaurantName, ownerName, email, phone, address, cuisine, avgMonthlyOrders, message });

    res.json({ success: true, message: "Application received. Our team will contact you within 24 hours." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WEBSOCKET ====================
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("join_order", (orderId) => {
    socket.join();
  });
  
  socket.on("join_driver", (driverId) => {
    socket.join();
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


// ==================== HEALTH + KEEPALIVE ====================
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ name: "Boufet API", status: "running", version: "1.0.0" });
});

// Self-ping every 4 minutes to prevent Railway 10min timeout
const SELF_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`
  : `http://localhost:${process.env.PORT || 3001}/health`;

setInterval(async () => {
  try {
    const { default: https } = await import(SELF_URL.startsWith("https") ? "https" : "http");
    https.get(SELF_URL, (res) => {
      console.log(`[keepalive] ping ${res.statusCode} ${new Date().toISOString()}`);
    }).on("error", (e) => console.error("[keepalive] error:", e.message));
  } catch(e) {
    console.error("[keepalive] failed:", e.message);
  }
}, 4 * 60 * 1000);

// ==================== IVRS ====================
import { initIvrs } from "./ivrs.js";
initIvrs(app);

// ==================== START ====================
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Boufet API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
