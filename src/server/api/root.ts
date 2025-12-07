import { githubRouter } from "@/server/api/routers/github";
import { paymentRouter } from "@/server/api/routers/payment";
import { readmeRouter } from "@/server/api/routers/readme";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  github: githubRouter,
  readme: readmeRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
