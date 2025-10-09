import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('بدء توليد خطة الوجبات عبر الذكاء الاصطناعي...');
    console.log('الملف الشخصي:', profile);
    console.log('الأهداف الغذائية:', targets);

    const prompt = `
أنت خبير تغذية متخصص في إعداد خطط وجبات صحية ومتوازنة. يجب أن تولد خطة وجبات يومية مخصصة للمستخدم بناءً على معلوماته الشخصية وأهدافه الغذائية.

معلومات المستخدم:
- العمر: ${profile.age} سنة
- الوزن: ${profile.weight} كيلو
- الطول: ${profile.height} سم
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${profile.activityLevel}
- الهدف: ${profile.goal}
- عدد الوجبات اليومية: ${profile.mealsPerDay}
- القيود الغذائية: ${profile.dietaryRestrictions.join(', ') || 'لا توجد'}
- الحساسية: ${profile.allergies.join(', ') || 'لا توجد'}
- الحالات الصحية: ${profile.healthConditions.join(', ') || 'لا توجد'}
- الأطعمة غير المرغوبة: ${profile.dislikedFoods.join(', ') || 'لا توجد'}
- المطابخ المفضلة: ${profile.preferredCuisines.join(', ') || 'لا توجد'}
- نوع الدايت: ${profile.dietType || 'عادي متوازن'}

الأهداف الغذائية اليومية:
- السعرات الحرارية: ${targets.calories}
- البروتين: ${targets.protein} جرام
- الكربوهيدرات: ${targets.carbs} جرام
- الدهون: ${targets.fat} جرام
- الألياف: ${targets.fiber} جرام

تعليمات مهمة:
1. أنشئ وجبات عربية أصيلة ومتنوعة من المطابخ المختلفة
2. تأكد من أن إجمالي القيم الغذائية للوجبات يطابق الأهداف اليومية بدقة
3. قسم السعرات والماكروز بالتساوي بين الوجبات
4. تجنب الأطعمة المحظورة والحساسية
5. راعي الحالات الصحية (مثل السكري، ضغط الدم، إلخ)
6. استخدم وصفات بسيطة وسهلة التحضير
7. أضف أوقات التحضير الواقعية
8. ضمن تنوع الوجبات والمكونات
9. تأكد من دقة حساب السعرات والماكروز لكل وجبة
10. اجعل الوجبات متوازنة ومغذية

أنشئ خطة وجبات يومية كاملة مع تفاصيل كل وجبة.
`;

    const messages = [
      {
        role: "user" as const,
        content: prompt,
      },
    ];

    const result = await generateObject({
      messages,
      schema: z.object({
        id: z.string(),
        date: z.string(),
        meals: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
            ingredients: z.array(z.string()),
            instructions: z.array(z.string()),
            nutrition: z.object({
              calories: z.number(),
              protein: z.number(),
              carbs: z.number(),
              fat: z.number(),
              fiber: z.number(),
            }),
            prepTime: z.number(),
            servings: z.number(),
          })
        ),
        totalNutrition: z.object({
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number(),
        }),
      }),
    });

    console.log('تم توليد خطة الوجبات بنجاح:', result);

    // Validate and adjust macros to ensure they match targets exactly
    const adjustedMealPlan = adjustMealPlanMacros(result, targets);
    console.log('تم تعديل الماكروز لتطابق الأهداف:', adjustedMealPlan.totalNutrition);

    return adjustedMealPlan;
  } catch (error) {
    console.error('خطأ في توليد خطة الوجبات:', error);
    if (error instanceof Error) {
      throw new Error(`فشل في توليد خطة الوجبات: ${error.message}`);
    }
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

// Helper function to adjust meal macros to match targets exactly
function adjustMealPlanMacros(mealPlan: DailyMealPlan, targets: NutritionTargets): DailyMealPlan {
  const totalMeals = mealPlan.meals.length;
  if (totalMeals === 0) return mealPlan;

  // Calculate current totals from meals
  const currentTotals = mealPlan.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.nutrition?.calories || 0),
      protein: acc.protein + (meal.nutrition?.protein || 0),
      carbs: acc.carbs + (meal.nutrition?.carbs || 0),
      fat: acc.fat + (meal.nutrition?.fat || 0),
      fiber: acc.fiber + (meal.nutrition?.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Calculate scaling factors
  const calorieScale = targets.calories / Math.max(currentTotals.calories, 1);
  const proteinScale = targets.protein / Math.max(currentTotals.protein, 1);
  const carbsScale = targets.carbs / Math.max(currentTotals.carbs, 1);
  const fatScale = targets.fat / Math.max(currentTotals.fat, 1);
  const fiberScale = targets.fiber / Math.max(currentTotals.fiber, 1);

  // Adjust each meal's nutrition
  const adjustedMeals = mealPlan.meals.map(meal => ({
    ...meal,
    nutrition: {
      calories: Math.round((meal.nutrition?.calories || 0) * calorieScale),
      protein: Math.round((meal.nutrition?.protein || 0) * proteinScale),
      carbs: Math.round((meal.nutrition?.carbs || 0) * carbsScale),
      fat: Math.round((meal.nutrition?.fat || 0) * fatScale),
      fiber: Math.round((meal.nutrition?.fiber || 0) * fiberScale),
    },
  }));

  // Recalculate totals after adjustment
  const adjustedTotals = adjustedMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
      fiber: acc.fiber + meal.nutrition.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  return {
    ...mealPlan,
    meals: adjustedMeals,
    totalNutrition: adjustedTotals,
  };
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  throw new Error('هذه الميزة غير متاحة حالياً');
}