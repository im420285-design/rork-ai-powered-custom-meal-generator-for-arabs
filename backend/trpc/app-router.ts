import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import generatePlanProcedure from "./routes/meals/generate-plan/route";
import regenerateMealProcedure from "./routes/meals/regenerate-meal/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  meals: createTRPCRouter({
    generatePlan: generatePlanProcedure,
    regenerateMeal: regenerateMealProcedure,
  }),
});

export type AppRouter = typeof appRouter;
