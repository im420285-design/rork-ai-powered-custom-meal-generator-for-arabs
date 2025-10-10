import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UtensilsCrossed, Calendar, Download } from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import MealCard from '@/components/MealCard';
import { Meal } from '@/types/nutrition';
import Colors from '@/constants/colors';
import { generateMealPlanPDF } from '@/services/pdf-generator';

export default function MealsScreen() {
  const { currentMealPlan } = useNutritionStore();
  const insets = useSafeAreaInsets();

  const handleGeneratePDF = async () => {
    if (!currentMealPlan) {
      Alert.alert('خطأ', 'لا توجد خطة وجبات لتوليد PDF');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('غير متاح', 'توليد PDF متاح فقط على الويب');
      return;
    }

    try {
      await generateMealPlanPDF(currentMealPlan);
      Alert.alert('نجاح', 'تم توليد ملف PDF بنجاح!');
    } catch (error) {
      console.error('خطأ في توليد PDF:', error);
      Alert.alert('خطأ', 'فشل في توليد ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  if (!currentMealPlan || !currentMealPlan.meals || !Array.isArray(currentMealPlan.meals) || currentMealPlan.meals.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <UtensilsCrossed size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyTitle}>لا توجد وجبات بعد</Text>
          <Text style={styles.emptySubtitle}>
            اذهب إلى الصفحة الرئيسية لتوليد خطط وجباتك
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          style={styles.pdfButton}
          onPress={handleGeneratePDF}
        >
          <Download size={20} color={Colors.light.primary} />
          <Text style={styles.pdfButtonText}>PDF</Text>
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
          />
        ))}
        
        {mealsByType.lunch && mealsByType.lunch.length > 0 && mealsByType.lunch.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
        
        {mealsByType.dinner && mealsByType.dinner.length > 0 && mealsByType.dinner.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
        
        {mealsByType.snack && mealsByType.snack.length > 0 && mealsByType.snack.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
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
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '10',
  },
  pdfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
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