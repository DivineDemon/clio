import { githubRouter } from "@/server/api/routers/github";
import { readmeRouter } from "@/server/api/routers/readme";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  github: githubRouter,
  readme: readmeRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
