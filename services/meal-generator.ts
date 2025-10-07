import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';
import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';

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

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  if (!profile || !targets) {
    throw new Error('بيانات الملف الشخصي أو الأهداف الغذائية غير مكتملة');
  }

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
أنت خبير تغذية متخصص في الطبخ العربي والشرق أوسطي. أريد منك إنشاء خطة وجبات يومية متكاملة ومتنوعة.

معلومات المستخدم:
- العمر: ${profile.age} سنة
- الوزن: ${profile.weight} كيلو
- الطول: ${profile.height} سم
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${profile.activityLevel}
- الهدف: ${profile.goal === 'lose' ? 'فقدان الوزن' : profile.goal === 'gain' ? 'زيادة الوزن' : 'الحفاظ على الوزن'}
- عدد الوجبات المطلوبة: ${mealsPerDay} وجبات${dietTypeInfo}

الأهداف الغذائية المطلوبة (يجب الالتزام بها بدقة):
- السعرات الحرارية الإجمالية: ${targets.calories} سعرة (الخطأ المسموح: ±${Math.round(targets.calories * 0.05)} سعرة)
- البروتين الإجمالي: ${targets.protein} جرام (الخطأ المسموح: ±${Math.round(targets.protein * 0.05)} جرام)
- الكربوهيدرات الإجمالية: ${targets.carbs} جرام (الخطأ المسموح: ±${Math.round(targets.carbs * 0.05)} جرام)
- الدهون الإجمالية: ${targets.fat} جرام (الخطأ المسموح: ±${Math.round(targets.fat * 0.05)} جرام)
- الألياف الإجمالية: ${targets.fiber} جرام (الخطأ المسموح: ±${Math.round(targets.fiber * 0.05)} جرام)

${dietaryInfo}
${mealDistribution}

شروط مهمة جداً:
1. استخدم مكونات متوفرة في المنطقة العربية
2. اجعل الوجبات متنوعة ولذيذة
3. احرص على التوازن الغذائي
4. اكتب كل شيء باللغة العربية
5. **احسب القيم الغذائية بدقة شديدة - يجب أن يكون مجموع القيم الغذائية لجميع الوجبات مطابقاً للأهداف المطلوبة بنسبة خطأ لا تتجاوز 5%**
6. اجعل الوصفات عملية وسهلة التحضير
7. راعي الحالات الصحية المذكورة:
   - إذا كان لديه سكري: قلل السكريات والكربوهيدرات البسيطة، ركز على الكربوهيدرات المعقدة
   - إذا كان لديه ضغط: قلل الملح والصوديوم، استخدم التوابل الطبيعية
   - إذا كان لديه كوليسترول: قلل الدهون المشبعة، استخدم زيت الزيتون
8. تجنب الأطعمة غير المرغوبة تماماً
9. ركز على المطابخ المفضلة إن وجدت
10. يجب أن يكون عدد الوجبات بالضبط ${mealsPerDay} وجبات
11. **تحقق من أن مجموع السعرات والماكروز لجميع الوجبات يساوي الأهداف المطلوبة (±5%)**
12. راعي نوع الدايت المختار في توزيع الماكروز

مثال على الدقة المطلوبة:
إذا كانت السعرات المطلوبة 2000، يجب أن يكون المجموع بين 1900-2100
إذا كان البروتين المطلوب 150جم، يجب أن يكون المجموع بين 142-158جم
`;

  try {
    console.log('بدء توليد خطة الوجبات...');
    const result = await generateObject({
      messages: [{ role: 'user', content: prompt }],
      schema: DailyMealPlanSchema
    });

    console.log('تم استلام النتيجة من AI:', result);

    if (!result || !result.meals || !Array.isArray(result.meals)) {
      throw new Error('النتيجة غير مكتملة من AI');
    }

    const meals: Meal[] = result.meals.map((mealData, index) => {
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
      } else if (profile.mealsPerDay >= 5) {
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

    console.log('تم إعداد قائمة الوجبات:', meals.length, 'وجبة');

    const totalNutrition = meals.reduce((total, meal) => {
      if (!meal.nutrition) {
        console.warn('وجبة بدون قيم غذائية:', meal.name);
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

    const caloriesDiff = Math.abs(totalNutrition.calories - targets.calories);
    const proteinDiff = Math.abs(totalNutrition.protein - targets.protein);
    const carbsDiff = Math.abs(totalNutrition.carbs - targets.carbs);
    const fatDiff = Math.abs(totalNutrition.fat - targets.fat);

    const caloriesError = (caloriesDiff / targets.calories) * 100;
    const proteinError = (proteinDiff / targets.protein) * 100;
    const carbsError = (carbsDiff / targets.carbs) * 100;
    const fatError = (fatDiff / targets.fat) * 100;

    console.log('نسبة الخطأ:');
    console.log(`- السعرات: ${caloriesError.toFixed(2)}%`);
    console.log(`- البروتين: ${proteinError.toFixed(2)}%`);
    console.log(`- الكربوهيدرات: ${carbsError.toFixed(2)}%`);
    console.log(`- الدهون: ${fatError.toFixed(2)}%`);

    if (caloriesError > 5 || proteinError > 5 || carbsError > 5 || fatError > 5) {
      console.warn('⚠️ تحذير: نسبة الخطأ تتجاوز 5% في بعض القيم الغذائية');
      console.warn('المطلوب:', targets);
      console.warn('الفعلي:', totalNutrition);
    }

    const mealPlan = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      meals,
      totalNutrition
    };

    console.log('تم إعداد خطة الوجبات بنجاح');
    return mealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  if (!meal || !targets || !profile) {
    throw new Error('بيانات غير مكتملة لتوليد الوجبة');
  }

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

  const maxCaloriesError = Math.round(targetCalories * 0.05);
  const maxProteinError = Math.round(targetProtein * 0.05);
  const maxCarbsError = Math.round(targetCarbs * 0.05);
  const maxFatError = Math.round(targetFat * 0.05);

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
أنت خبير تغذية متخصص في الطبخ العربي. أريد منك إنشاء وجبة ${mealTypeArabic[meal.type]} جديدة ومختلفة تماماً عن الوجبة السابقة.

الوجبة السابقة كانت: ${meal.name}

المطلوب وجبة جديدة بنفس القيم الغذائية بدقة (نسبة خطأ لا تتجاوز 5%):
- السعرات الحرارية: ${targetCalories} سعرة (الخطأ المسموح: ±${maxCaloriesError} سعرة)
- البروتين: ${targetProtein} جرام (الخطأ المسموح: ±${maxProteinError} جرام)
- الكربوهيدرات: ${targetCarbs} جرام (الخطأ المسموح: ±${maxCarbsError} جرام)
- الدهون: ${targetFat} جرام (الخطأ المسموح: ±${maxFatError} جرام)

معلومات المستخدم:
- الهدف: ${profile.goal === 'lose' ? 'فقدان الوزن' : profile.goal === 'gain' ? 'زيادة الوزن' : 'الحفاظ على الوزن'}${dietTypeInfo}
- قيود غذائية: ${(profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) ? profile.dietaryRestrictions.join(', ') : 'لا توجد'}
- حساسية: ${(profile.allergies && profile.allergies.length > 0) ? profile.allergies.join(', ') : 'لا توجد'}
- حالات صحية: ${(profile.healthConditions && profile.healthConditions.length > 0) ? profile.healthConditions.join(', ') : 'لا توجد'}
- أطعمة غير مرغوبة: ${(profile.dislikedFoods && profile.dislikedFoods.length > 0) ? profile.dislikedFoods.join(', ') : 'لا توجد'}
- المطابخ المفضلة: ${(profile.preferredCuisines && profile.preferredCuisines.length > 0) ? profile.preferredCuisines.join(', ') : 'جميع المطابخ العربية'}

شروط مهمة:
1. استخدم مكونات عربية أصيلة ومتوفرة
2. اجعل الوجبة مختلفة تماماً عن السابقة
3. احرص على التوازن الغذائي
4. اكتب باللغة العربية
5. **احسب القيم الغذائية بدقة شديدة - يجب أن تكون القيم الغذائية مطابقة للمطلوب بنسبة خطأ لا تتجاوز 5%**
6. اجعل الوصفة عملية وسهلة
7. راعي الحالات الصحية:
   - إذا كان لديه سكري: قلل السكريات والكربوهيدرات البسيطة
   - إذا كان لديه ضغط: قلل الملح والصوديوم
   - إذا كان لديه كوليسترول: قلل الدهون المشبعة
8. تجنب الأطعمة غير المرغوبة تماماً
9. ركز على المطابخ المفضلة
10. راعي نوع الدايت المختار في اختيار المكونات
`;

  try {
    const result = await generateObject({
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
  } catch (error) {
    console.error('Error regenerating meal:', error);
    throw new Error('فشل في توليد وجبة جديدة. يرجى المحاولة مرة أخرى.');
  }
}