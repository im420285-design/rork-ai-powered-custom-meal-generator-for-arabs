import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { generateObject } from '@rork/toolkit-sdk';

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

export const regenerateMealProcedure = publicProcedure
  .input(z.object({
    meal: z.object({
      id: z.string(),
      type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      name: z.string(),
      nutrition: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        fiber: z.number()
      })
    }),
    profile: UserProfileSchema,
    category: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { meal, profile, category } = input;

    const mealTypeArabic = {
      breakfast: 'إفطار',
      lunch: 'غداء',
      dinner: 'عشاء',
      snack: 'وجبة خفيفة'
    };

    const targetCalories = meal.nutrition?.calories || 0;
    const targetProtein = meal.nutrition?.protein || 0;
    const targetCarbs = meal.nutrition?.carbs || 0;
    const targetFat = meal.nutrition?.fat || 0;

    const dietTypeInfo = profile.dietType ? `
- نوع الدايت: ${profile.dietType === 'keto' ? 'كيتو (قليل جداً من الكربوهيدرات، عالي الدهون)' : 
    profile.dietType === 'low_carb' ? 'قليل الكربوهيدرات' :
    profile.dietType === 'high_protein' ? 'عالي البروتين' :
    profile.dietType === 'balanced' ? 'متوازن' :
    profile.dietType === 'intermittent_fasting' ? 'صيام متقطع' :
    profile.dietType === 'mediterranean' ? 'البحر المتوسط' :
    profile.dietType === 'paleo' ? 'باليو' :
    profile.dietType === 'vegan' ? 'نباتي' : 'متوازن'}` : '';

    const categoryInfo = category ? `

**مهم جداً: يجب أن تكون الوجبة من فئة "${category}"**
مثال:
- إذا كانت الفئة "أسماك": استخدم سمك السلمون، التونة، الجمبري، إلخ
- إذا كانت الفئة "لحوم": استخدم لحم البقر، الدجاج، الديك الرومي، إلخ
- إذا كانت الفئة "نباتي": لا تستخدم أي لحوم أو أسماك، فقط خضروات وبقوليات ومكسرات
- إذا كانت الفئة "بيض ومنتجات ألبان": ركز على البيض، الجبن، الزبادي، الحليب
- إذا كانت الفئة "حبوب كاملة": استخدم الشوفان، الكينوا، الأرز البني، الخبز الأسمر` : '';

    const prompt = `
أنشئ وجبة ${mealTypeArabic[meal.type]} عربية جديدة بسرعة.

السابقة: ${meal.name}${categoryInfo}

القيم المطلوبة (±5%):
- ${targetCalories} سعرة
- ${targetProtein}جم بروتين
- ${targetCarbs}جم كربوهيدرات
- ${targetFat}جم دهون

المستخدم:
- ${profile.goal === 'lose' ? 'فقدان وزن' : profile.goal === 'gain' ? 'زيادة وزن' : 'حفاظ'}${dietTypeInfo}
- قيود: ${(profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) ? profile.dietaryRestrictions.join(', ') : 'لا'}
- حساسية: ${(profile.allergies && profile.allergies.length > 0) ? profile.allergies.join(', ') : 'لا'}
- صحة: ${(profile.healthConditions && profile.healthConditions.length > 0) ? profile.healthConditions.join(', ') : 'لا'}
- لا يحب: ${(profile.dislikedFoods && profile.dislikedFoods.length > 0) ? profile.dislikedFoods.join(', ') : 'لا'}
- مطابخ: ${(profile.preferredCuisines && profile.preferredCuisines.length > 0) ? profile.preferredCuisines.join(', ') : 'عربي'}

مهم:
1. وجبة مختلفة تماماً
2. مكونات عربية متوفرة
3. قيم غذائية دقيقة (±5%)
4. راعي القيود والحالات الصحية${category ? '\n5. التزم بفئة: ' + category : ''}
`;

    const result: any = await generateObject({
      messages: [{ role: 'user', content: prompt }],
      schema: MealSchema
    });

    return {
      id: `${meal.type}-${Date.now()}`,
      type: meal.type,
      name: result.name || mealTypeArabic[meal.type],
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
      instructions: Array.isArray(result.instructions) ? result.instructions : [],
      nutrition: result.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      prepTime: result.prepTime || 30,
      servings: result.servings || 1
    };
  });

export default regenerateMealProcedure;
