import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { trpcClient } from '@/lib/trpc';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  if (!profile || !targets) {
    throw new Error('بيانات الملف الشخصي أو الأهداف الغذائية غير مكتملة');
  }

  try {
    console.log('بدء توليد خطة الوجبات عبر tRPC...');
    
    const mealPlan = await trpcClient.meals.generatePlan.mutate({
      profile,
      targets
    });

    console.log('تم إعداد خطة الوجبات بنجاح');
    return mealPlan as DailyMealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile,
  category?: string
): Promise<Meal> {
  if (!meal || !targets || !profile) {
    throw new Error('بيانات غير مكتملة لتوليد الوجبة');
  }

  try {
    console.log('بدء توليد وجبة جديدة عبر tRPC...');
    
    const newMeal = await trpcClient.meals.regenerateMeal.mutate({
      meal: {
        id: meal.id,
        type: meal.type,
        name: meal.name,
        nutrition: meal.nutrition
      },
      profile,
      category
    });

    return newMeal as Meal;
  } catch (error) {
    console.error('Error regenerating meal:', error);
    throw new Error('فشل في توليد وجبة جديدة. يرجى المحاولة مرة أخرى.');
  }
}
