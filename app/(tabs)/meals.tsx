import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

import { UtensilsCrossed, RefreshCw, Calendar } from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import { generateDailyMealPlan } from '@/services/meal-generator';
import MealCard from '@/components/MealCard';
import { Meal } from '@/types/nutrition';
import Colors from '@/constants/colors';

export default function MealsScreen() {
  const { 
    currentMealPlan, 
    userProfile, 
    nutritionTargets,
    isGenerating,
    setCurrentMealPlan,
    setIsGenerating
  } = useNutritionStore();

  const handleMealUpdated = (updatedMeal: Meal) => {
    console.log('تحديث الوجبة:', updatedMeal.name);
    if (!currentMealPlan || !currentMealPlan.meals || !Array.isArray(currentMealPlan.meals) || currentMealPlan.meals.length === 0) {
      console.log('لا توجد خطة وجبات حالية أو الوجبات غير صحيحة');
      return;
    }

    const updatedMeals = currentMealPlan.meals.map((meal: Meal) => {
      if (meal.id === updatedMeal.id) {
        console.log('تم العثور على الوجبة وتحديثها:', meal.name, '->', updatedMeal.name);
        return updatedMeal;
      }
      return meal;
    });

    const totalNutrition = updatedMeals.reduce((total: any, meal: Meal) => ({
      calories: total.calories + (meal.nutrition?.calories || 0),
      protein: total.protein + (meal.nutrition?.protein || 0),
      carbs: total.carbs + (meal.nutrition?.carbs || 0),
      fat: total.fat + (meal.nutrition?.fat || 0),
      fiber: total.fiber + (meal.nutrition?.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    console.log('إجمالي التغذية الجديد:', totalNutrition);
    
    const updatedMealPlan = {
      ...currentMealPlan,
      meals: updatedMeals,
      totalNutrition
    };
    
    console.log('تحديث خطة الوجبات بالوجبة الجديدة');
    setCurrentMealPlan(updatedMealPlan);
  };

  const handleRegenerateAll = async () => {
    if (!userProfile || !nutritionTargets) {
      Alert.alert('خطأ', 'يرجى إعداد الملف الشخصي أولاً');
      return;
    }

    Alert.alert(
      'تغيير جميع الوجبات',
      'هل تريد توليد خطة وجبات جديدة كاملة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          onPress: async () => {
            setIsGenerating(true);
            try {
              console.log('بدء توليد خطة وجبات جديدة');
              const newMealPlan = await generateDailyMealPlan(userProfile, nutritionTargets);
              console.log('تم توليد خطة وجبات جديدة:', newMealPlan);
              setCurrentMealPlan(newMealPlan);
            } catch (error) {
              console.error('خطأ في توليد خطة الوجبات:', error);
              Alert.alert('خطأ', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
            } finally {
              setIsGenerating(false);
            }
          }
        }
      ]
    );
  };

  if (!currentMealPlan || !currentMealPlan.meals || !Array.isArray(currentMealPlan.meals) || currentMealPlan.meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <UtensilsCrossed size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyTitle}>لا توجد وجبات بعد</Text>
          <Text style={styles.emptySubtitle}>
            اذهب إلى الصفحة الرئيسية لتوليد خطة وجباتك
          </Text>
        </View>
      </View>
    );
  }

  const meals = currentMealPlan?.meals || [];
  const mealsByType = {
    breakfast: meals.filter((meal) => meal.type === 'breakfast'),
    lunch: meals.filter((meal) => meal.type === 'lunch'),
    dinner: meals.filter((meal) => meal.type === 'dinner'),
    snack: meals.filter((meal) => meal.type === 'snack')
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Calendar size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>خطة وجباتك اليومية</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.regenerateAllButton}
          onPress={handleRegenerateAll}
          disabled={isGenerating}
        >
          <RefreshCw size={20} color={Colors.light.primary} />
          <Text style={styles.regenerateAllText}>تغيير الكل</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionSummary}>
        <Text style={styles.summaryTitle}>الإجمالي اليومي</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.calories || 0}</Text>
            <Text style={styles.summaryLabel}>سعرة</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.protein || 0}</Text>
            <Text style={styles.summaryLabel}>بروتين</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.carbs || 0}</Text>
            <Text style={styles.summaryLabel}>كربوهيدرات</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.fat || 0}</Text>
            <Text style={styles.summaryLabel}>دهون</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mealsContainer}>
        {mealsByType.breakfast && mealsByType.breakfast.length > 0 && mealsByType.breakfast.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onMealUpdated={handleMealUpdated}
          />
        ))}
        
        {mealsByType.lunch && mealsByType.lunch.length > 0 && mealsByType.lunch.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onMealUpdated={handleMealUpdated}
          />
        ))}
        
        {mealsByType.dinner && mealsByType.dinner.length > 0 && mealsByType.dinner.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onMealUpdated={handleMealUpdated}
          />
        ))}
        
        {mealsByType.snack && mealsByType.snack.length > 0 && mealsByType.snack.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onMealUpdated={handleMealUpdated}
          />
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginTop: 2,
  },
  regenerateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  regenerateAllText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  nutritionSummary: {
    backgroundColor: Colors.light.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.light.gray[600],
    marginTop: 2,
  },
  mealsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});