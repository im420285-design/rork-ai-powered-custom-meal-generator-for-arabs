import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { generateText } from '@rork/toolkit-sdk';

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('بدء توليد خطة الوجبات...');
    console.log('الملف الشخصي:', profile);
    console.log('الأهداف الغذائية:', targets);

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealsToGenerate = mealTypes.slice(0, profile.mealsPerDay);

    const caloriesPerMeal = Math.round(targets.calories / profile.mealsPerDay);
    const proteinPerMeal = Math.round(targets.protein / profile.mealsPerDay);
    const carbsPerMeal = Math.round(targets.carbs / profile.mealsPerDay);
    const fatPerMeal = Math.round(targets.fat / profile.mealsPerDay);
    const fiberPerMeal = Math.round(targets.fiber / profile.mealsPerDay);

    const dietTypeDescriptions: Record<string, string> = {
      keto: 'كيتو (قليل جداً من الكربوهيدرات، عالي الدهون)',
      low_carb: 'قليل الكربوهيدرات',
      high_protein: 'عالي البروتين',
      balanced: 'متوازن',
      intermittent_fasting: 'صيام متقطع',
      mediterranean: 'البحر الأبيض المتوسط',
      paleo: 'باليو',
      vegan: 'نباتي',
    };

    const prompt = `أنت خبير تغذية متخصص في الطعام العربي. قم بتوليد خطة وجبات يومية كاملة بصيغة JSON.

معلومات المستخدم:
- العمر: ${profile.age} سنة
- الوزن: ${profile.weight} كجم
- الطول: ${profile.height} سم
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${profile.activityLevel}
- الهدف: ${profile.goal === 'lose' ? 'خسارة وزن' : profile.goal === 'gain' ? 'زيادة وزن' : 'الحفاظ على الوزن'}
- نوع النظام الغذائي: ${profile.dietType ? dietTypeDescriptions[profile.dietType] : 'متوازن'}
- عدد الوجبات: ${profile.mealsPerDay}

الأهداف الغذائية اليومية:
- السعرات: ${targets.calories} سعرة
- البروتين: ${targets.protein} جرام
- الكربوهيدرات: ${targets.carbs} جرام
- الدهون: ${targets.fat} جرام
- الألياف: ${targets.fiber} جرام

القيود الغذائية: ${profile.dietaryRestrictions.length > 0 ? profile.dietaryRestrictions.join('، ') : 'لا يوجد'}
الحساسية: ${profile.allergies.length > 0 ? profile.allergies.join('، ') : 'لا يوجد'}
الحالات الصحية: ${profile.healthConditions.length > 0 ? profile.healthConditions.join('، ') : 'لا يوجد'}
الأطعمة غير المرغوبة: ${profile.dislikedFoods.length > 0 ? profile.dislikedFoods.join('، ') : 'لا يوجد'}
المطابخ المفضلة: ${profile.preferredCuisines.length > 0 ? profile.preferredCuisines.join('، ') : 'جميع المطابخ العربية'}

يجب توليد ${profile.mealsPerDay} وجبات (${mealsToGenerate.join('، ')}).

لكل وجبة، يجب أن تحتوي على:
- السعرات: حوالي ${caloriesPerMeal} سعرة
- البروتين: حوالي ${proteinPerMeal} جرام
- الكربوهيدرات: حوالي ${carbsPerMeal} جرام
- الدهون: حوالي ${fatPerMeal} جرام
- الألياف: حوالي ${fiberPerMeal} جرام

متطلبات مهمة:
1. يجب أن تكون جميع الوجبات من الطعام العربي الأصيل
2. يجب أن تكون الوصفات واقعية وقابلة للتطبيق
3. يجب أن تكون المكونات متوفرة بسهولة
4. يجب أن تكون التعليمات واضحة ومفصلة
5. يجب احترام جميع القيود الغذائية والحساسية
6. يجب تجنب الأطعمة غير المرغوبة
7. يجب أن تكون الوجبات متنوعة ولذيذة
8. يجب أن تكون القيم الغذائية دقيقة قدر الإمكان

أرجع JSON فقط بهذا الشكل بالضبط (بدون أي نص إضافي):
{
  "meals": [
    {
      "name": "اسم الوجبة بالعربي",
      "type": "breakfast أو lunch أو dinner أو snack",
      "ingredients": ["مكون 1 مع الكمية", "مكون 2 مع الكمية"],
      "instructions": ["خطوة 1", "خطوة 2"],
      "nutrition": {
        "calories": رقم,
        "protein": رقم,
        "carbs": رقم,
        "fat": رقم,
        "fiber": رقم
      },
      "prepTime": رقم بالدقائق,
      "servings": عدد الحصص
    }
  ]
}`;

    console.log('إرسال الطلب إلى AI...');
    const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
    console.log('استجابة AI:', response);

    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);
    
    if (!parsed.meals || !Array.isArray(parsed.meals)) {
      throw new Error('Invalid response format from AI');
    }

    const meals = parsed.meals.map((meal: any, index: number) => ({
      id: `meal-${Date.now()}-${index}`,
      name: meal.name,
      type: meal.type,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      nutrition: meal.nutrition,
      prepTime: meal.prepTime,
      servings: meal.servings,
    }));

    const totalNutrition = meals.reduce(
      (acc: { calories: number; protein: number; carbs: number; fat: number; fiber: number }, meal: any) => ({
        calories: acc.calories + meal.nutrition.calories,
        protein: acc.protein + meal.nutrition.protein,
        carbs: acc.carbs + meal.nutrition.carbs,
        fat: acc.fat + meal.nutrition.fat,
        fiber: acc.fiber + meal.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const mealPlan = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString(),
      meals,
      totalNutrition,
    };

    console.log('تم توليد خطة الوجبات بنجاح:', mealPlan);
    return mealPlan;
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
