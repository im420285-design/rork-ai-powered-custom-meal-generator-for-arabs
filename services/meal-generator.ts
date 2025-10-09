import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { trpcClient } from '@/lib/trpc';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('استدعاء tRPC لتوليد خطة الوجبات...');
    const mealPlan = await trpcClient.meals.generatePlan.mutate({
      profile,
      targets,
    });
    console.log('تم استلام خطة الوجبات من الخادم');
    return mealPlan;
  } catch (error) {
    console.error('خطأ في استدعاء tRPC:', error);
    if (error instanceof Error) {
      throw new Error(`خطأ في توليد الوجبات: ${error.message}`);
    }
    throw new Error('خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  throw new Error('هذه الميزة غير متاحة حالياً');
}
