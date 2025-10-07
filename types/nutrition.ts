export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  mealsPerDay: number;
  dietaryRestrictions: string[];
  allergies: string[];
  healthConditions: string[];
  dislikedFoods: string[];
  preferredCuisines: string[];
  dietType?: string;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  prepTime: number;
  servings: number;
}

export interface DailyMealPlan {
  id: string;
  date: string;
  meals: Meal[];
  totalNutrition: NutritionTargets;
}