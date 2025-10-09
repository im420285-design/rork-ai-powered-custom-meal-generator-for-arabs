import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { generateObject } from '@rork/toolkit-sdk';

const UserProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  age: z.number(),
  gender: z.enum(['male', 'female']),
  weight: z.number(),
  height: z.number(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  dietType: z.enum(['keto', 'low_carb', 'high_protein', 'balanced', 'intermittent_fasting', 'mediterranean', 'paleo', 'vegan']).optional(),
  mealsPerDay: z.number().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  healthConditions: z.array(z.string()).optional(),
  dislikedFoods: z.array(z.string()).optional(),
  preferredCuisines: z.array(z.string()).optional(),
});

const NutritionTargetsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});

const MealSchema = z.object({
  name: z.string().describe('اسم الوجبة باللغة العربية'),
  ingredients: z.array(z.string()).describe('قائمة المكونات مع الكميات باللغة العربية'),
  instructions: z.array(z.string()).describe('خطوات التحضير باللغة العربية'),
  nutrition: z.object({
    calories: z.number().describe('السعرات الحرارية'),
    protein: z.number().describe('البروتين بالجرام'),
    carbs: z.number().describe('الكربوهيدرات بالجرام'),
    fat: z.number().describe('الدهون بالجرام'),
    fiber: z.number().describe('الألياف بالجرام')
  }),
  prepTime: z.number().describe('وقت التحضير بالدقائق'),
  servings: z.number().describe('عدد الحصص')
});

const DailyMealPlanSchema = z.object({
  meals: z.array(MealSchema).describe('قائمة الوجبات اليومية')
});

export const generatePlanProcedure = publicProcedure
  .input(z.object({
    profile: UserProfileSchema,
    targets: NutritionTargetsSchema,
  }))
  .mutation(async ({ input }) => {
    const { profile, targets } = input;

    const dietaryInfo = [
      (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) ? `قيود غذائية: ${profile.dietaryRestrictions.join(', ')}` : '',
      (profile.allergies && profile.allergies.length > 0) ? `حساسية من: ${profile.allergies.join(', ')}` : '',
      (profile.healthConditions && profile.healthConditions.length > 0) ? `حالات صحية: ${profile.healthConditions.join(', ')}` : '',
      (profile.dislikedFoods && profile.dislikedFoods.length > 0) ? `أطعمة غير مرغوبة: ${profile.dislikedFoods.join(', ')}` : '',
      (profile.preferredCuisines && profile.preferredCuisines.length > 0) ? `المطابخ المفضلة: ${profile.preferredCuisines.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    const mealsPerDay = profile.mealsPerDay || 3;
    let mealDistribution = '';
    
    if (mealsPerDay === 2) {
      mealDistribution = `
المطلوب:
1. إفطار صحي ومشبع (40% من السعرات)
2. غداء متوازن وغني (60% من السعرات)
`;
    } else if (mealsPerDay === 3) {
      mealDistribution = `
المطلوب:
1. إفطار صحي ومشبع (30% من السعرات)
2. غداء متوازن وغني (40% من السعرات)
3. عشاء خفيف ومغذي (30% من السعرات)
`;
    } else if (mealsPerDay === 4) {
      mealDistribution = `
المطلوب:
1. إفطار صحي ومشبع (25% من السعرات)
2. غداء متوازن وغني (35% من السعرات)
3. عشاء خفيف ومغذي (25% من السعرات)
4. وجبة خفيفة صحية (15% من السعرات)
`;
    } else if (mealsPerDay === 5) {
      mealDistribution = `
المطلوب:
1. إفطار صحي ومشبع (25% من السعرات)
2. وجبة خفيفة صباحية (10% من السعرات)
3. غداء متوازن وغني (30% من السعرات)
4. وجبة خفيفة مسائية (10% من السعرات)
5. عشاء خفيف ومغذي (25% من السعرات)
`;
    } else if (mealsPerDay === 6) {
      mealDistribution = `
المطلوب:
1. إفطار صحي ومشبع (20% من السعرات)
2. وجبة خفيفة صباحية (10% من السعرات)
3. غداء متوازن وغني (25% من السعرات)
4. وجبة خفيفة بعد الظهر (10% من السعرات)
5. عشاء خفيف ومغذي (20% من السعرات)
6. وجبة خفيفة مسائية (15% من السعرات)
`;
    }

    const dietTypeInfo = profile.dietType ? `
- نوع الدايت: ${profile.dietType === 'keto' ? 'كيتو (قليل جداً من الكربوهيدرات، عالي الدهون)' : 
    profile.dietType === 'low_carb' ? 'قليل الكربوهيدرات' :
    profile.dietType === 'high_protein' ? 'عالي البروتين' :
    profile.dietType === 'balanced' ? 'متوازن' :
    profile.dietType === 'intermittent_fasting' ? 'صيام متقطع' :
    profile.dietType === 'mediterranean' ? 'البحر المتوسط' :
    profile.dietType === 'paleo' ? 'باليو' :
    profile.dietType === 'vegan' ? 'نباتي' : 'متوازن'}` : '';

    const prompt = `
أنت خبير تغذية. أنشئ ${mealsPerDay} وجبات عربية بسرعة.

المستخدم: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}, ${profile.age} سنة, ${profile.weight}كجم, ${profile.height}سم
الهدف: ${profile.goal === 'lose' ? 'فقدان وزن' : profile.goal === 'gain' ? 'زيادة وزن' : 'حفاظ'}${dietTypeInfo}

الأهداف اليومية (±5%):
- ${targets.calories} سعرة
- ${targets.protein}جم بروتين
- ${targets.carbs}جم كربوهيدرات  
- ${targets.fat}جم دهون
- ${targets.fiber}جم ألياف

${dietaryInfo ? dietaryInfo : 'لا قيود'}
${mealDistribution}

مهم:
1. وجبات عربية بسيطة ومتوفرة
2. احسب القيم الغذائية بدقة
3. المجموع = الأهداف (±5%)
4. ${mealsPerDay} وجبات فقط
5. تجنب الأطعمة غير المرغوبة
6. راعي نوع الدايت في الماكروز
`;

    console.log('بدء توليد خطة الوجبات...');
    
    const result = await generateObject({
      messages: [{ role: 'user', content: prompt }],
      schema: DailyMealPlanSchema
    });

    console.log('تم استلام النتيجة من AI');

    if (!result || !result.meals || !Array.isArray(result.meals)) {
      throw new Error('النتيجة غير مكتملة من AI');
    }

    const meals = result.meals.map((mealData: any, index: number) => {
      let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
      
      if (index === 0) {
        mealType = 'breakfast';
      } else if (profile.mealsPerDay === 2 && index === 1) {
        mealType = 'lunch';
      } else if (profile.mealsPerDay === 3) {
        if (index === 1) mealType = 'lunch';
        else if (index === 2) mealType = 'dinner';
      } else if (profile.mealsPerDay === 4) {
        if (index === 1) mealType = 'lunch';
        else if (index === 2) mealType = 'dinner';
        else mealType = 'snack';
      } else if (profile.mealsPerDay && profile.mealsPerDay >= 5) {
        if (index === 0) mealType = 'breakfast';
        else if (index === 2 || (profile.mealsPerDay === 5 && index === 2)) mealType = 'lunch';
        else if (index === profile.mealsPerDay - 1 || (profile.mealsPerDay === 5 && index === 4)) mealType = 'dinner';
        else mealType = 'snack';
      }
      
      return {
        id: `${mealType}-${Date.now()}-${index}`,
        type: mealType,
        name: mealData.name || 'وجبة',
        ingredients: Array.isArray(mealData.ingredients) ? mealData.ingredients : [],
        instructions: Array.isArray(mealData.instructions) ? mealData.instructions : [],
        nutrition: mealData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        prepTime: mealData.prepTime || 30,
        servings: mealData.servings || 1
      };
    });

    const totalNutrition = meals.reduce((total, meal) => {
      if (!meal.nutrition) {
        return total;
      }
      return {
        calories: total.calories + (meal.nutrition.calories || 0),
        protein: total.protein + (meal.nutrition.protein || 0),
        carbs: total.carbs + (meal.nutrition.carbs || 0),
        fat: total.fat + (meal.nutrition.fat || 0),
        fiber: total.fiber + (meal.nutrition.fiber || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    console.log('إجمالي القيم الغذائية:', totalNutrition);

    const mealPlan = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      meals,
      totalNutrition
    };

    console.log('تم إعداد خطة الوجبات بنجاح');
    return mealPlan;
  });

export default generatePlanProcedure;
