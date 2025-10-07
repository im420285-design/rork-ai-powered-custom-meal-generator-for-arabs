import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { UserProfile, NutritionTargets, DailyMealPlan } from '@/types/nutrition';
import { useStorage } from '@/providers/storage';

export const [NutritionProvider, useNutritionStore] = createContextHook(() => {
  const { getItem, setItem } = useStorage();
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null);
  const [currentMealPlan, setCurrentMealPlanState] = useState<DailyMealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateNutritionTargets = useCallback((profile: UserProfile): NutritionTargets => {
    if (!profile?.age || !profile?.weight || !profile?.height) {
      console.error('بيانات الملف الشخصي غير مكتملة:', profile);
      throw new Error('Invalid profile data');
    }

    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let calories = bmr * activityMultipliers[profile.activityLevel];

    if (profile.goal === 'lose') {
      calories -= 500;
    } else if (profile.goal === 'gain') {
      calories += 500;
    }

    let proteinPercent = 0.25;
    let fatPercent = 0.30;
    let carbsPercent = 0.45;

    if (profile.dietType === 'keto') {
      proteinPercent = 0.25;
      fatPercent = 0.70;
      carbsPercent = 0.05;
    } else if (profile.dietType === 'low_carb') {
      proteinPercent = 0.30;
      fatPercent = 0.50;
      carbsPercent = 0.20;
    } else if (profile.dietType === 'high_protein') {
      proteinPercent = 0.40;
      fatPercent = 0.25;
      carbsPercent = 0.35;
    } else if (profile.dietType === 'balanced') {
      proteinPercent = 0.25;
      fatPercent = 0.30;
      carbsPercent = 0.45;
    } else if (profile.dietType === 'intermittent_fasting') {
      proteinPercent = 0.30;
      fatPercent = 0.30;
      carbsPercent = 0.40;
    } else if (profile.dietType === 'mediterranean') {
      proteinPercent = 0.20;
      fatPercent = 0.35;
      carbsPercent = 0.45;
    } else if (profile.dietType === 'paleo') {
      proteinPercent = 0.30;
      fatPercent = 0.40;
      carbsPercent = 0.30;
    } else if (profile.dietType === 'vegan') {
      proteinPercent = 0.20;
      fatPercent = 0.25;
      carbsPercent = 0.55;
    }

    const protein = (calories * proteinPercent) / 4;
    const fat = (calories * fatPercent) / 9;
    const carbs = (calories * carbsPercent) / 4;
    const fiber = Math.max(25, calories / 1000 * 14);

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber)
    };
  }, []);

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      if (!profile || typeof profile !== 'object') {
        console.error('Invalid profile data for saving');
        return;
      }
      await setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }, [setItem]);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    if (!profile) {
      setUserProfileState(null);
      setNutritionTargets(null);
      return;
    }

    if (typeof profile !== 'object') {
      console.error('Invalid profile data');
      return;
    }

    const targets = calculateNutritionTargets(profile);
    setUserProfileState(profile);
    setNutritionTargets(targets);
    saveUserProfile(profile);
  }, [calculateNutritionTargets, saveUserProfile]);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('بدء تحميل الملف الشخصي...');
      const stored = await getItem('userProfile');
      if (stored && stored.trim()) {
        const profile = JSON.parse(stored) as UserProfile;
        if (profile && typeof profile === 'object') {
          console.log('تم تحميل الملف الشخصي:', profile);
          const targets = calculateNutritionTargets(profile);
          console.log('تم حساب الأهداف الغذائية:', targets);
          setUserProfileState(profile);
          setNutritionTargets(targets);
        }
      } else {
        console.log('لا يوجد ملف شخصي محفوظ');
      }
      
      const storedMealPlan = await getItem('currentMealPlan');
      if (storedMealPlan && storedMealPlan.trim()) {
        const mealPlan = JSON.parse(storedMealPlan) as DailyMealPlan;
        if (mealPlan && typeof mealPlan === 'object' && mealPlan.meals) {
          console.log('تم تحميل خطة الوجبات:', mealPlan.meals.length, 'وجبات');
          setCurrentMealPlanState(mealPlan);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [getItem, calculateNutritionTargets]);

  const setCurrentMealPlan = useCallback(async (mealPlan: DailyMealPlan | null) => {
    console.log('تحديث خطة الوجبات:', mealPlan ? `${mealPlan.meals?.length || 0} وجبات` : 'null');
    setCurrentMealPlanState(mealPlan);
    if (mealPlan) {
      try {
        await setItem('currentMealPlan', JSON.stringify(mealPlan));
        console.log('تم حفظ خطة الوجبات في التخزين');
      } catch (error) {
        console.error('خطأ في حفظ خطة الوجبات:', error);
      }
    }
  }, [setItem]);

  const validateMacros = useCallback((targets: NutritionTargets): { valid: boolean; message?: string; corrected?: NutritionTargets } => {
    const proteinCals = targets.protein * 4;
    const carbsCals = targets.carbs * 4;
    const fatCals = targets.fat * 9;
    const totalMacroCals = proteinCals + carbsCals + fatCals;

    const tolerance = 50;
    const diff = Math.abs(totalMacroCals - targets.calories);

    if (diff > tolerance) {
      const proteinPercent = proteinCals / totalMacroCals;
      const carbsPercent = carbsCals / totalMacroCals;
      const fatPercent = fatCals / totalMacroCals;

      const correctedProtein = Math.round((targets.calories * proteinPercent) / 4);
      const correctedCarbs = Math.round((targets.calories * carbsPercent) / 4);
      const correctedFat = Math.round((targets.calories * fatPercent) / 9);

      return {
        valid: false,
        message: `السعرات الحرارية (${targets.calories}) لا تتوافق مع الماكروز (${Math.round(totalMacroCals)}). يجب أن تكون:\nالبروتين: ${correctedProtein}جم\nالكربوهيدرات: ${correctedCarbs}جم\nالدهون: ${correctedFat}جم`,
        corrected: {
          calories: targets.calories,
          protein: correctedProtein,
          carbs: correctedCarbs,
          fat: correctedFat,
          fiber: targets.fiber
        }
      };
    }

    return { valid: true };
  }, []);

  const updateNutritionTargets = useCallback((targets: NutritionTargets) => {
    setNutritionTargets(targets);
  }, []);

  return useMemo(() => ({
    userProfile,
    nutritionTargets,
    currentMealPlan,
    isGenerating,
    setUserProfile,
    calculateNutritionTargets,
    setCurrentMealPlan,
    setIsGenerating,
    loadUserProfile,
    saveUserProfile,
    updateNutritionTargets,
    validateMacros
  }), [
    userProfile,
    nutritionTargets,
    currentMealPlan,
    isGenerating,
    setUserProfile,
    calculateNutritionTargets,
    setCurrentMealPlan,
    loadUserProfile,
    saveUserProfile,
    updateNutritionTargets,
    validateMacros
  ]);
});