import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const userProfileSchema = z.object({
  age: z.number(),
  weight: z.number(),
  height: z.number(),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  mealsPerDay: z.number(),
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  healthConditions: z.array(z.string()),
  dislikedFoods: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
  dietType: z.enum(['keto', 'low_carb', 'high_protein', 'balanced', 'intermittent_fasting', 'mediterranean', 'paleo', 'vegan']).optional(),
});

const nutritionTargetsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});

export const generatePlanProcedure = publicProcedure
  .input(z.object({
    profile: userProfileSchema,
    targets: nutritionTargetsSchema,
  }))
  .mutation(async ({ input }) => {
    console.log('بدء توليد خطة الوجبات...');
    console.log('الملف الشخصي:', input.profile);
    console.log('الأهداف الغذائية:', input.targets);

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealsToGenerate = mealTypes.slice(0, input.profile.mealsPerDay);

    const caloriesPerMeal = Math.round(input.targets.calories / input.profile.mealsPerDay);
    const proteinPerMeal = Math.round(input.targets.protein / input.profile.mealsPerDay);
    const carbsPerMeal = Math.round(input.targets.carbs / input.profile.mealsPerDay);
    const fatPerMeal = Math.round(input.targets.fat / input.profile.mealsPerDay);
    const fiberPerMeal = Math.round(input.targets.fiber / input.profile.mealsPerDay);

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
- العمر: ${input.profile.age} سنة
- الوزن: ${input.profile.weight} كجم
- الطول: ${input.profile.height} سم
- الجنس: ${input.profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${input.profile.activityLevel}
- الهدف: ${input.profile.goal === 'lose' ? 'خسارة وزن' : input.profile.goal === 'gain' ? 'زيادة وزن' : 'الحفاظ على الوزن'}
- نوع النظام الغذائي: ${input.profile.dietType ? dietTypeDescriptions[input.profile.dietType] : 'متوازن'}
- عدد الوجبات: ${input.profile.mealsPerDay}

الأهداف الغذائية اليومية:
- السعرات: ${input.targets.calories} سعرة
- البروتين: ${input.targets.protein} جرام
- الكربوهيدرات: ${input.targets.carbs} جرام
- الدهون: ${input.targets.fat} جرام
- الألياف: ${input.targets.fiber} جرام

القيود الغذائية: ${input.profile.dietaryRestrictions.length > 0 ? input.profile.dietaryRestrictions.join('، ') : 'لا يوجد'}
الحساسية: ${input.profile.allergies.length > 0 ? input.profile.allergies.join('، ') : 'لا يوجد'}
الحالات الصحية: ${input.profile.healthConditions.length > 0 ? input.profile.healthConditions.join('، ') : 'لا يوجد'}
الأطعمة غير المرغوبة: ${input.profile.dislikedFoods.length > 0 ? input.profile.dislikedFoods.join('، ') : 'لا يوجد'}
المطابخ المفضلة: ${input.profile.preferredCuisines.length > 0 ? input.profile.preferredCuisines.join('، ') : 'جميع المطابخ العربية'}

يجب توليد ${input.profile.mealsPerDay} وجبات (${mealsToGenerate.join('، ')}).

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

    try {
      console.log('إرسال الطلب إلى Hugging Face API...');
      
      const HF_API_KEY = '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';
      const HF_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
      
      const hfResponse = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false,
            },
          }),
        }
      );

      if (!hfResponse.ok) {
        const errorText = await hfResponse.text();
        console.error('Hugging Face API Error:', errorText);
        throw new Error(`Hugging Face API error: ${hfResponse.status}`);
      }

      const hfData = await hfResponse.json();
      console.log('استجابة Hugging Face:', hfData);
      
      let response = '';
      if (Array.isArray(hfData) && hfData[0]?.generated_text) {
        response = hfData[0].generated_text;
      } else if (typeof hfData === 'string') {
        response = hfData;
      } else {
        throw new Error('Invalid response format from Hugging Face');
      }

      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
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
      throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
    }
  });
