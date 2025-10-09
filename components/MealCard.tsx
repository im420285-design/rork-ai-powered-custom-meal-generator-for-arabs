import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { 
  Clock, 
  Users, 
  Zap, 
  Beef, 
  Wheat, 
  Droplets, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Meal } from '@/types/nutrition';
import { useNutritionStore } from '@/providers/nutrition-provider';
import { regenerateMeal } from '@/services/meal-generator';
import Colors from '@/constants/colors';

interface Props {
  meal: Meal;
  onMealUpdated: (updatedMeal: Meal) => void;
}

const MEAL_CATEGORIES = [
  { id: 'fish', label: 'أسماك', icon: '🐟' },
  { id: 'meat', label: 'لحوم', icon: '🥩' },
  { id: 'chicken', label: 'دجاج', icon: '🍗' },
  { id: 'vegetarian', label: 'نباتي', icon: '🥗' },
  { id: 'eggs_dairy', label: 'بيض ومنتجات ألبان', icon: '🥚' },
  { id: 'whole_grains', label: 'حبوب كاملة', icon: '🌾' },
];

export default function MealCard({ meal, onMealUpdated }: Props) {
  const { userProfile, nutritionTargets } = useNutritionStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const mealTypeLabels = {
    breakfast: 'إفطار',
    lunch: 'غداء',
    dinner: 'عشاء',
    snack: 'وجبة خفيفة'
  };

  const mealTypeColors = {
    breakfast: '#FF6B35',
    lunch: '#4FD1C7',
    dinner: '#9F7AEA',
    snack: '#48BB78'
  };

  const handleRegenerate = async () => {
    console.log('بدء عملية تغيير الوجبة:', meal.name);
    
    if (!userProfile || !nutritionTargets) {
      console.log('خطأ: لا يوجد ملف شخصي أو أهداف غذائية');
      Alert.alert('خطأ', 'يرجى إعداد الملف الشخصي أولاً');
      return;
    }

    if (!meal || !meal.nutrition) {
      console.log('خطأ: بيانات الوجبة غير صحيحة');
      Alert.alert('خطأ', 'بيانات الوجبة غير صحيحة');
      return;
    }

    setShowCategoryModal(true);
  };

  const handleCategorySelect = async (categoryId: string | null) => {
    setShowCategoryModal(false);
    
    const categoryLabel = categoryId ? MEAL_CATEGORIES.find(c => c.id === categoryId)?.label : null;
    
    console.log('المستخدم اختار الفئة:', categoryLabel || 'عشوائي');
    setIsRegenerating(true);
    try {
      console.log('بدء توليد وجبة جديدة:', meal.name);
      if (!nutritionTargets || !userProfile) return;
      const newMeal = await regenerateMeal(meal, nutritionTargets, userProfile, categoryLabel || undefined);
      console.log('تم توليد وجبة جديدة:', newMeal.name);
      console.log('استدعاء onMealUpdated لتحديث الوجبة');
      onMealUpdated(newMeal);
      console.log('تم استدعاء onMealUpdated بنجاح');
    } catch (error) {
      console.error('خطأ في توليد الوجبة:', error);
      Alert.alert('خطأ', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      console.log('انتهاء عملية توليد الوجبة');
      setIsRegenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mealTypeContainer}>
          <View 
            style={[
              styles.mealTypeBadge, 
              { backgroundColor: mealTypeColors[meal.type] + '20' }
            ]}
          >
            <Text 
              style={[
                styles.mealTypeText, 
                { color: mealTypeColors[meal.type] }
              ]}
            >
              {mealTypeLabels[meal.type]}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.regenerateButton}
          onPress={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <RefreshCw size={20} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.mealName}>{meal.name}</Text>

      <View style={styles.quickInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color={Colors.light.gray[500]} />
          <Text style={styles.infoText}>{meal.prepTime || 0} دقيقة</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color={Colors.light.gray[500]} />
          <Text style={styles.infoText}>{meal.servings || 1} حصة</Text>
        </View>
        <View style={styles.infoItem}>
          <Zap size={16} color={Colors.light.primary} />
          <Text style={[styles.infoText, { color: Colors.light.primary }]}>
            {meal.nutrition?.calories || 0} سعرة
          </Text>
        </View>
      </View>

      <View style={styles.nutritionSummary}>
        <View style={styles.nutritionItem}>
          <Beef size={14} color={Colors.light.error} />
          <Text style={styles.nutritionText}>{meal.nutrition?.protein || 0}جم</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Wheat size={14} color={Colors.light.warning} />
          <Text style={styles.nutritionText}>{meal.nutrition?.carbs || 0}جم</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Droplets size={14} color={Colors.light.secondary} />
          <Text style={styles.nutritionText}>{meal.nutrition?.fat || 0}جم</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Text>
        {isExpanded ? (
          <ChevronUp size={16} color={Colors.light.primary} />
        ) : (
          <ChevronDown size={16} color={Colors.light.primary} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المكونات:</Text>
            {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? meal.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.listItem}>• {ingredient}</Text>
            )) : (
              <Text style={styles.listItem}>لا توجد معلومات عن المكونات</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>طريقة التحضير:</Text>
            {meal.instructions && Array.isArray(meal.instructions) && meal.instructions.length > 0 ? meal.instructions.map((instruction, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {instruction}
              </Text>
            )) : (
              <Text style={styles.listItem}>لا توجد معلومات عن طريقة التحضير</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>القيم الغذائية التفصيلية:</Text>
            <View style={styles.detailedNutrition}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>السعرات الحرارية:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.calories || 0} سعرة</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>البروتين:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.protein || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الكربوهيدرات:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.carbs || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الدهون:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.fat || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الألياف:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.fiber || 0} جرام</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر نوع الوجبة</Text>
            <Text style={styles.modalSubtitle}>
              اختر فئة معينة أو اضغط على &quot;عشوائي&quot; لتوليد وجبة متنوعة
            </Text>
            
            <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={styles.categoryIcon}>🎲</Text>
                <Text style={styles.categoryLabel}>عشوائي</Text>
              </TouchableOpacity>

              {MEAL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryButton}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flex: 1,
  },
  mealTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  regenerateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.gray[600],
  },
  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: Colors.light.gray[50],
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray[200],
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: Colors.light.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  detailedNutrition: {
    backgroundColor: Colors.light.gray[50],
    borderRadius: 8,
    padding: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: Colors.light.gray[200],
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.gray[700],
  },
});