const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// মিডলওয়্যার
app.use(express.json());
app.use(cors());

// মেমোরিতে অর্ডার স্টোর করার অ্যারে (ডেটাবেজের বিকল্প হিসেবে কাজ করবে)
let localOrders = [];

// রুট বা টেস্ট রাউট
app.get("/", (req, res) => {
  res.send("TrendyNest Server is running smoothly! 🚀");
});

// পেমেন্ট মক API রাউট
app.post("/api/create-bkash-payment", async (req, res) => {
  try {
    const { amount } = req.body;
    res.json({ success: true, message: "Payment gateway initialized", amount });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ success: false, message: "Server connection failed" });
  }
});

// অর্ডার সেভ করার API রাউট (লোকাল মেমোরিতে সেভ হবে)
app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = req.body;
    localOrders.unshift(newOrder); // সবার উপরে নতুন অর্ডার যোগ করা
    console.log("📦 New Order Received & Saved:", newOrder.id);
    res.status(201).json({ success: true, message: "Order saved successfully!" });
  } catch (error) {
    console.error("Order Save Error:", error);
    res.status(500).json({ success: false, message: "Failed to save order." });
  }
});

// সব অর্ডার দেখার API রাউট (এডমিন প্যানেলের জন্য প্রয়োজন হতে পারে)
app.get("/api/orders", (req, res) => {
  res.json(localOrders);
});

// সার্ভার স্টার্ট করা
app.listen(PORT, () => {
  console.log(`🟢 TrendyNest Server is running successfully on port ${PORT}`);
});