import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generatePlanProcedure } from "./routes/meals/generate-plan/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  meals: createTRPCRouter({
    generatePlan: generatePlanProcedure,
  }),
});

export type AppRouter = typeof appRouter;
