import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/env";
import { db } from "@/server/db";
import { stripe } from "@/server/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : "Unknown Error"}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
