import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { trpcClient } from '@/lib/trpc';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('بدء توليد خطة الوجبات عبر الخادم المحلي...');
    console.log('الملف الشخصي:', profile);
    console.log('الأهداف الغذائية:', targets);

    const result = await trpcClient.meals.generatePlan.mutate({
      profile,
      targets,
    });

    console.log('تم توليد خطة الوجبات بنجاح:', result);
    return result;
  } catch (error) {
    console.error('خطأ في توليد خطة الوجبات:', error);
    if (error instanceof Error) {
      throw new Error(`فشل في توليد خطة الوجبات: ${error.message}`);
    }
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  throw new Error('هذه الميزة غير متاحة حالياً');
}