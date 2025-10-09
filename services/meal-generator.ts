import { UserProfile, NutritionTargets, Meal, DailyMealPlan, UserAuth } from '@/types/nutrition';
import { trpcClient } from '@/lib/trpc';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets,
  userAuth?: UserAuth
): Promise<DailyMealPlan> {
  if (!profile || !targets) {
    throw new Error('بيانات الملف الشخصي أو الأهداف الغذائية غير مكتملة');
  }

  try {
    console.log('بدء توليد خطة الوجبات عبر tRPC...');
    console.log('Profile mealsPerDay:', profile.mealsPerDay);
    console.log('Targets calories:', targets.calories);
    
    const fullProfile = {
      ...profile,
      name: userAuth?.name || 'User',
      email: userAuth?.email || 'user@example.com',
      phone: userAuth?.phoneNumber
    };
    
    console.log('إرسال الطلب إلى الخادم...');
    const startTime = Date.now();
    
    const mealPlan = await trpcClient.meals.generatePlan.mutate({
      profile: fullProfile,
      targets
    });
    
    const duration = Date.now() - startTime;
    console.log(`تم إعداد خطة الوجبات بنجاح في ${duration}ms`);
    console.log('عدد الوجبات:', mealPlan.meals?.length);
    
    return mealPlan as DailyMealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      if (error.message.includes('Timeout') || error.message.includes('timeout')) {
        throw new Error('استغرق توليد الوجبات وقتاً طويلاً. يرجى المحاولة مرة أخرى.');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
      }
    }
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile,
  category?: string,
  userAuth?: UserAuth
): Promise<Meal> {
  if (!meal || !targets || !profile) {
    throw new Error('بيانات غير مكتملة لتوليد الوجبة');
  }

  try {
    console.log('بدء توليد وجبة جديدة عبر tRPC...');
    console.log('Meal type:', meal.type, 'Category:', category);
    
    const fullProfile = {
      ...profile,
      name: userAuth?.name || 'User',
      email: userAuth?.email || 'user@example.com',
      phone: userAuth?.phoneNumber
    };
    
    const startTime = Date.now();
    
    const newMeal = await trpcClient.meals.regenerateMeal.mutate({
      meal: {
        id: meal.id,
        type: meal.type,
        name: meal.name,
        nutrition: meal.nutrition
      },
      profile: fullProfile,
      category
    });
    
    const duration = Date.now() - startTime;
    console.log(`تم توليد الوجبة الجديدة في ${duration}ms`);

    return newMeal as Meal;
  } catch (error) {
    console.error('Error regenerating meal:', error);
    if (error instanceof Error) {
      if (error.message.includes('Timeout') || error.message.includes('timeout')) {
        throw new Error('استغرق توليد الوجبة وقتاً طويلاً. يرجى المحاولة مرة أخرى.');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
      }
    }
    throw new Error('فشل في توليد وجبة جديدة. يرجى المحاولة مرة أخرى.');
  }
}
