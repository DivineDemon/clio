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
      select: { credits: true, freeGenerationsUsed: true },
    });

    if (!user) return null;

    if (user.freeGenerationsUsed === 0) {
      const jobCount = await ctx.db.readmeJob.count({
        where: { userId: ctx.session.user.id },
      });

      return {
        ...user,
        freeGenerationsUsed: Math.max(user.freeGenerationsUsed, jobCount),
      };
    }

    return user;
  }),
});
