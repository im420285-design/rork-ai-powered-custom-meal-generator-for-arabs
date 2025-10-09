import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  throw new Error('هذه الميزة غير متاحة حالياً');
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  throw new Error('هذه الميزة غير متاحة حالياً');
}
