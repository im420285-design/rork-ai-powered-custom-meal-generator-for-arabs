import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

function clampNumber(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round(n: number): number {
  return Math.round(n);
}

function normalizeTargets(t: NutritionTargets): NutritionTargets {
  const proteinCals = t.protein * 4;
  const carbsCals = t.carbs * 4;
  const fatCals = t.fat * 9;
  const macroCals = proteinCals + carbsCals + fatCals;
  if (macroCals === 0) return t;
  const scale = t.calories / macroCals;
  const protein = round(t.protein * scale);
  const carbs = round(t.carbs * scale);
  const fat = round(t.fat * scale);
  return { calories: round(t.calories), protein, carbs, fat, fiber: round(t.fiber) };
}

function defaultDistribution(mealsPerDay: number): number[] {
  const n = clampNumber(mealsPerDay, 1, 6);
  if (n === 1) return [1];
  if (n === 2) return [0.45, 0.55];
  if (n === 3) return [0.3, 0.4, 0.3];
  if (n === 4) return [0.25, 0.35, 0.25, 0.15];
  if (n === 5) return [0.22, 0.34, 0.24, 0.1, 0.1];
  return [0.2, 0.3, 0.25, 0.15, 0.05, 0.05];
}

function repartitionMacros(perc: number, t: NutritionTargets) {
  const calories = round(t.calories * perc);
  const protein = round(t.protein * perc);
  const carbs = round(t.carbs * perc);
  const fat = round(t.fat * perc);
  const fiber = round(t.fiber * perc);
  return { calories, protein, carbs, fat, fiber } as const;
}

function reconcileCaloriesFromMacros(n: { protein: number; carbs: number; fat: number; calories: number; fiber: number }) {
  const calcCals = n.protein * 4 + n.carbs * 4 + n.fat * 9;
  // Prefer macro-driven calories for internal consistency
  return { ...n, calories: round(calcCals) };
}

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('بدء توليد خطة الوجبات عبر الذكاء الاصطناعي...');
    console.log('الملف الشخصي:', profile);
    console.log('الأهداف الغذائية (قبل التطبيع):', targets);

    const normalizedTargets = normalizeTargets(targets);
    console.log('الأهداف الغذائية (بعد التطبيع):', normalizedTargets);

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
- السعرات الحرارية: ${normalizedTargets.calories}
- البروتين: ${normalizedTargets.protein} جرام
- الكربوهيدرات: ${normalizedTargets.carbs} جرام
- الدهون: ${normalizedTargets.fat} جرام
- الألياف: ${normalizedTargets.fiber} جرام

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

    const distribution = defaultDistribution(profile.mealsPerDay ?? result.meals.length);
    const orderedMeals = [...result.meals].sort((a, b) => {
      const order: Record<Meal['type'], number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
      return (order[a.type] ?? 9) - (order[b.type] ?? 9);
    });

    const adjustedMeals = orderedMeals.map((meal, idx) => {
      const perc = distribution[idx] ?? (1 / Math.max(distribution.length, 1));
      const perMeal = repartitionMacros(perc, normalizedTargets);
      const reconciled = reconcileCaloriesFromMacros(perMeal);
      return {
        ...meal,
        servings: meal.servings ?? 1,
        prepTime: meal.prepTime ?? 15,
        nutrition: {
          calories: reconciled.calories,
          protein: reconciled.protein,
          carbs: reconciled.carbs,
          fat: reconciled.fat,
          fiber: reconciled.fiber,
        },
      } as Meal;
    });

    // Balance rounding differences to hit totals exactly
    const sum = adjustedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.nutrition?.calories ?? 0),
        protein: acc.protein + (m.nutrition?.protein ?? 0),
        carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
        fat: acc.fat + (m.nutrition?.fat ?? 0),
        fiber: acc.fiber + (m.nutrition?.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const deltas = {
      calories: normalizedTargets.calories - sum.calories,
      protein: normalizedTargets.protein - sum.protein,
      carbs: normalizedTargets.carbs - sum.carbs,
      fat: normalizedTargets.fat - sum.fat,
      fiber: normalizedTargets.fiber - sum.fiber,
    } as const;

    const lastIdx = adjustedMeals.length - 1;
    if (lastIdx >= 0) {
      const last = adjustedMeals[lastIdx];
      adjustedMeals[lastIdx] = {
        ...last,
        nutrition: {
          calories: (last.nutrition?.calories ?? 0) + deltas.calories,
          protein: (last.nutrition?.protein ?? 0) + deltas.protein,
          carbs: (last.nutrition?.carbs ?? 0) + deltas.carbs,
          fat: (last.nutrition?.fat ?? 0) + deltas.fat,
          fiber: (last.nutrition?.fiber ?? 0) + deltas.fiber,
        },
      } as Meal;
    }

    const finalTotals = adjustedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.nutrition?.calories ?? 0),
        protein: acc.protein + (m.nutrition?.protein ?? 0),
        carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
        fat: acc.fat + (m.nutrition?.fat ?? 0),
        fiber: acc.fiber + (m.nutrition?.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const adjustedMealPlan: DailyMealPlan = {
      id: result.id,
      date: result.date,
      meals: adjustedMeals,
      totalNutrition: finalTotals,
    };

    console.log('تم ضبط الماكروز وتنسيقها بدقة:', adjustedMealPlan.totalNutrition);

    return adjustedMealPlan;
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