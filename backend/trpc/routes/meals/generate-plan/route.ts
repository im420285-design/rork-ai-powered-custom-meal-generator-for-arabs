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

    try {
      console.log('توليد خطة الوجبات محلياً...');
      
      const mealNames: Record<string, string[]> = {
        breakfast: [
          'فول مدمس مع البيض والخبز البلدي',
          'شكشوكة بالطماطم والفلفل',
          'لبنة مع زيت الزيتون والزعتر',
          'عجة بالخضار والجبن',
          'فتة حمص بالزبادي',
        ],
        lunch: [
          'دجاج مشوي مع الأرز البني والسلطة',
          'سمك مشوي مع البطاطس المسلوقة',
          'كفتة مشوية مع الخضار المشوية',
          'مجدرة بالأرز والعدس',
          'كبسة دجاج بالخضار',
        ],
        dinner: [
          'شوربة عدس مع الخبز المحمص',
          'سلطة تونة مع الخضار الطازجة',
          'صدر دجاج مشوي مع السلطة',
          'شوربة خضار بالدجاج',
          'بيض مسلوق مع الخضار',
        ],
        snack: [
          'زبادي يوناني مع المكسرات والعسل',
          'تفاح مع زبدة الفول السوداني',
          'حمص بالطحينة مع الخضار',
          'جبن قريش مع الخيار والطماطم',
          'موز مع حفنة من اللوز',
        ],
      };

      const mealIngredients: Record<string, string[][]> = {
        breakfast: [
          ['200 جرام فول مدمس', '2 بيضة مسلوقة', '1 رغيف خبز بلدي', '1 ملعقة كبيرة زيت زيتون', 'كمون وليمون'],
          ['3 بيضات', '2 حبة طماطم', '1 فلفل أخضر', '1 بصلة صغيرة', 'ملعقة زيت زيتون', 'بهارات'],
          ['150 جرام لبنة', '2 ملعقة كبيرة زيت زيتون', 'زعتر', '1 رغيف خبز', 'خيار وطماطم'],
          ['3 بيضات', '50 جرام جبن', 'خضار مشكلة', 'ملعقة زيت', 'بهارات'],
          ['150 جرام حمص مسلوق', '100 جرام زبادي', 'خبز محمص', 'طحينة', 'ثوم وليمون'],
        ],
        lunch: [
          ['200 جرام صدر دجاج', '150 جرام أرز بني', 'سلطة خضراء', 'ملعقة زيت زيتون', 'بهارات'],
          ['200 جرام سمك', '200 جرام بطاطس', 'خضار مشوية', 'ليمون', 'بهارات'],
          ['200 جرام لحم مفروم', 'بصل وبقدونس', 'خضار مشوية', 'بهارات'],
          ['150 جرام أرز', '100 جرام عدس', 'بصل مقلي', 'زيت زيتون'],
          ['200 جرام دجاج', '150 جرام أرز', 'خضار مشكلة', 'بهارات كبسة'],
        ],
        dinner: [
          ['150 جرام عدس', 'خضار مشكلة', 'خبز محمص', 'كمون وليمون'],
          ['علبة تونة', 'خس وطماطم وخيار', 'زيت زيتون وليمون', 'ذرة'],
          ['150 جرام صدر دجاج', 'سلطة خضراء كبيرة', 'زيت زيتون'],
          ['100 جرام دجاج', 'خضار مشكلة', 'مرق دجاج', 'بهارات'],
          ['2 بيضة مسلوقة', 'خيار وطماطم', 'خس', 'زيت زيتون'],
        ],
        snack: [
          ['150 جرام زبادي يوناني', '30 جرام مكسرات', 'ملعقة عسل'],
          ['1 تفاحة متوسطة', '2 ملعقة كبيرة زبدة فول سوداني'],
          ['100 جرام حمص', '2 ملعقة طحينة', 'خيار وجزر'],
          ['100 جرام جبن قريش', 'خيار وطماطم', 'زيت زيتون'],
          ['1 موزة', '30 جرام لوز'],
        ],
      };

      const mealInstructions: Record<string, string[][]> = {
        breakfast: [
          ['سخن الفول في قدر على نار هادئة', 'اسلق البيض لمدة 7 دقائق', 'سخن الخبز', 'قدم الفول مع البيض والخبز وزيت الزيتون'],
          ['قطع الطماطم والفلفل والبصل', 'اقلي الخضار في الزيت', 'أضف البيض المخفوق', 'قلب حتى ينضج'],
          ['ضع اللبنة في طبق', 'أضف زيت الزيتون والزعتر', 'قدمها مع الخبز والخضار'],
          ['اخفق البيض مع الجبن', 'أضف الخضار المقطعة', 'اقلي في مقلاة حتى تنضج'],
          ['اهرس الحمص قليلاً', 'أضف الزبادي والطحينة', 'قدمه مع الخبز المحمص'],
        ],
        lunch: [
          ['تبل الدجاج بالبهارات', 'اشوي الدجاج في الفرن', 'اسلق الأرز', 'حضر السلطة', 'قدم الوجبة'],
          ['تبل السمك بالليمون والبهارات', 'اشوي السمك', 'اسلق البطاطس', 'اشوي الخضار'],
          ['اخلط اللحم مع البصل والبقدونس', 'شكل الكفتة', 'اشويها', 'قدمها مع الخضار'],
          ['اسلق العدس والأرز معاً', 'اقلي البصل حتى يحمر', 'قدم المجدرة مع البصل المقلي'],
          ['تبل الدجاج ببهارات الكبسة', 'اطبخ الأرز مع الدجاج والخضار', 'قدم ساخناً'],
        ],
        dinner: [
          ['اسلق العدس مع الخضار', 'اخلطهم حتى يصبح شوربة', 'قدمها مع الخبز المحمص'],
          ['صفي التونة', 'قطع الخضار', 'اخلط كل المكونات', 'أضف الزيت والليمون'],
          ['تبل الدجاج', 'اشويه حتى ينضج', 'حضر السلطة', 'قدمهم معاً'],
          ['اسلق الدجاج مع الخضار', 'أضف المرق والبهارات', 'اطبخ حتى تنضج'],
          ['اسلق البيض', 'قطع الخضار', 'قدمهم مع زيت الزيتون'],
        ],
        snack: [
          ['ضع الزبادي في وعاء', 'أضف المكسرات والعسل', 'قدمه بارداً'],
          ['قطع التفاح', 'ادهنه بزبدة الفول السوداني'],
          ['ضع الحمص في طبق', 'أضف الطحينة', 'قدمه مع الخضار'],
          ['ضع الجبن في طبق', 'أضف الخضار المقطعة', 'رش زيت الزيتون'],
          ['قشر الموز', 'قدمه مع اللوز'],
        ],
      };

      const meals = mealsToGenerate.map((type, index) => {
        const mealIndex = Math.floor(Math.random() * mealNames[type].length);
        
        let nutrition = {
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: carbsPerMeal,
          fat: fatPerMeal,
          fiber: fiberPerMeal,
        };

        const variance = 0.1;
        nutrition = {
          calories: Math.round(nutrition.calories * (1 + (Math.random() * variance * 2 - variance))),
          protein: Math.round(nutrition.protein * (1 + (Math.random() * variance * 2 - variance))),
          carbs: Math.round(nutrition.carbs * (1 + (Math.random() * variance * 2 - variance))),
          fat: Math.round(nutrition.fat * (1 + (Math.random() * variance * 2 - variance))),
          fiber: Math.round(nutrition.fiber * (1 + (Math.random() * variance * 2 - variance))),
        };

        return {
          id: `meal-${Date.now()}-${index}`,
          name: mealNames[type][mealIndex],
          type,
          ingredients: mealIngredients[type][mealIndex],
          instructions: mealInstructions[type][mealIndex],
          nutrition,
          prepTime: type === 'snack' ? 5 : type === 'breakfast' ? 15 : 30,
          servings: 1,
        };
      });

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
