import { env } from "@/env";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { stripe } from "@/server/stripe";

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await ctx.db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "README Generation Credit",
              description: "One-time credit for generating a premium README.",
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: user.id,
      },
    });

    return { url: session.url };
  }),

  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user) return null;

    // Sync logic: Ensure freeGenerationsUsed reflects total jobs for legacy purposes
    // (We assume all existing jobs count against free tier until credit system is active)
    const totalJobCount = await ctx.db.readmeJob.count({
      where: { userId: ctx.session.user.id },
    });

    let effectiveFreeUsed = user.freeGenerationsUsed;

    // If total jobs exceeds what we tracked as "free used", update the tracker
    // This catches legacy jobs that happened before we started tracking
    if (totalJobCount > user.freeGenerationsUsed) {
      await ctx.db.user.update({
        where: { id: user.id },
        data: { freeGenerationsUsed: totalJobCount },
      });
      effectiveFreeUsed = totalJobCount;
    }

    return {
      ...user,
      freeGenerationsUsed: effectiveFreeUsed,
    };
  }),
});
