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
    return result as DailyMealPlan;
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