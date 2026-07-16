import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import Order from "../models/order.model";
import Payment from "../models/payment.model";
import { z } from "zod";

const stripe = new Stripe(env.stripeSecretKey);

const checkoutSessionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

const verifySessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = checkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.issues });
      return;
    }

    const { orderId } = parsed.data;

    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.paymentStatus === "paid") {
      res.status(400).json({ success: false, message: "Order already paid" });
      return;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${env.clientUrl}/orders/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientUrl}/checkout?cancelled=true`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ success: true, data: { url: session.url } });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = verifySessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.issues });
      return;
    }

    const { sessionId } = parsed.data;

    const existing = await Payment.findOne({ stripeSessionId: sessionId });
    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    if (stripeSession.status !== "complete") {
      res.status(400).json({ success: false, message: "Payment not completed" });
      return;
    }

    const order = await Order.findOne({ stripeSessionId: sessionId, userId: req.userId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const paymentIntentId = typeof stripeSession.payment_intent === "string"
      ? stripeSession.payment_intent
      : stripeSession.payment_intent?.id || "";

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.userId,
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      amount: (stripeSession.amount_total || 0) / 100,
      currency: stripeSession.currency || "usd",
      status: "paid",
      customerEmail: stripeSession.customer_details?.email ?? undefined,
    });

    order.paymentStatus = "paid";
    await order.save();

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}


