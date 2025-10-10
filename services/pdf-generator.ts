import { DailyMealPlan, Meal } from '@/types/nutrition';
import { Platform } from 'react-native';

export async function generateMealPlanPDF(mealPlan: DailyMealPlan): Promise<void> {
  try {
    console.log('بدء توليد ملف PDF لخطة الوجبات...');

    const htmlContent = generateHTMLContent(mealPlan);

    if (Platform.OS === 'web') {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const options = {
        margin: 1,
        filename: `خطة-الوجبات-${new Date().toLocaleDateString('ar-SA')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(options).from(htmlContent).save();
      console.log('تم توليد ملف PDF بنجاح');
    } else {
      throw new Error('PDF generation is only supported on web platform');
    }
  } catch (error) {
    console.error('خطأ في توليد ملف PDF:', error);
    throw new Error('فشل في توليد ملف PDF. يرجى المحاولة مرة أخرى.');
  }
}

function generateHTMLContent(mealPlan: DailyMealPlan): string {
  const date = new Date(mealPlan.date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mealTypeLabels = {
    breakfast: 'الفطور',
    lunch: 'الغداء',
    dinner: 'العشاء',
    snack: 'الوجبة الخفيفة'
  };

  const mealsHTML = mealPlan.meals.map((meal: Meal) => `
    <div class="meal-card">
      <div class="meal-header">
        <h3 class="meal-name">${meal.name}</h3>
        <span class="meal-type">${mealTypeLabels[meal.type]}</span>
      </div>
      
      <div class="meal-info">
        <div class="info-item">
          <span class="info-label">وقت التحضير:</span>
          <span class="info-value">${meal.prepTime || 0} دقيقة</span>
        </div>
        <div class="info-item">
          <span class="info-label">الحصص:</span>
          <span class="info-value">${meal.servings || 1} حصة</span>
        </div>
        <div class="info-item">
          <span class="info-label">السعرات:</span>
          <span class="info-value">${meal.nutrition?.calories || 0} سعرة</span>
        </div>
      </div>

      <div class="nutrition-summary">
        <div class="nutrition-item">
          <span class="nutrition-label">بروتين:</span>
          <span class="nutrition-value">${meal.nutrition?.protein || 0}جم</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-label">كربوهيدرات:</span>
          <span class="nutrition-value">${meal.nutrition?.carbs || 0}جم</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-label">دهون:</span>
          <span class="nutrition-value">${meal.nutrition?.fat || 0}جم</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-label">ألياف:</span>
          <span class="nutrition-value">${meal.nutrition?.fiber || 0}جم</span>
        </div>
      </div>

      <div class="ingredients">
        <h4>المكونات:</h4>
        <ul>
          ${meal.ingredients && Array.isArray(meal.ingredients) ? meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') : '<li>لا توجد معلومات عن المكونات</li>'}
        </ul>
      </div>

      <div class="instructions">
        <h4>طريقة التحضير:</h4>
        <ol>
          ${meal.instructions && Array.isArray(meal.instructions) ? meal.instructions.map(instruction => `<li>${instruction}</li>`).join('') : '<li>لا توجد معلومات عن طريقة التحضير</li>'}
        </ol>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>خطة الوجبات اليومية</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        
        .header {
          text-align: center;
          background: linear-gradient(135deg, #DC143C, #FF6B35);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 18px;
          opacity: 0.9;
        }
        
        .summary {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .summary h2 {
          margin: 0 0 20px 0;
          color: #DC143C;
          font-size: 24px;
          text-align: center;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .summary-value {
          display: block;
          font-size: 28px;
          font-weight: bold;
          color: #DC143C;
          margin-bottom: 5px;
        }
        
        .summary-label {
          font-size: 14px;
          color: #666;
        }
        
        .meal-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        
        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #DC143C;
          padding-bottom: 15px;
        }
        
        .meal-name {
          margin: 0;
          font-size: 24px;
          color: #333;
          font-weight: bold;
        }
        
        .meal-type {
          background: #DC143C;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .meal-info {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        
        .info-item {
          text-align: center;
        }
        
        .info-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        
        .nutrition-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 25px;
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
        }
        
        .nutrition-item {
          text-align: center;
        }
        
        .nutrition-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 3px;
        }
        
        .nutrition-value {
          font-size: 16px;
          font-weight: bold;
          color: #4FD1C7;
        }
        
        .ingredients, .instructions {
          margin-bottom: 20px;
        }
        
        .ingredients h4, .instructions h4 {
          color: #DC143C;
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        
        ul, ol {
          margin: 0;
          padding-right: 20px;
        }
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 14px;
          color: #666;
        }
        
        @media print {
          body {
            background: white !important;
          }
          .meal-card {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>خطة الوجبات اليومية</h1>
        <p>${date}</p>
      </div>
      
      <div class="summary">
        <h2>الإجمالي اليومي</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-value">${mealPlan.totalNutrition?.calories || 0}</span>
            <span class="summary-label">سعرة حرارية</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${mealPlan.totalNutrition?.protein || 0}</span>
            <span class="summary-label">جرام بروتين</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${mealPlan.totalNutrition?.carbs || 0}</span>
            <span class="summary-label">جرام كربوهيدرات</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${mealPlan.totalNutrition?.fat || 0}</span>
            <span class="summary-label">جرام دهون</span>
          </div>
        </div>
      </div>
      
      ${mealsHTML}
      
      <div class="footer">
        <p>تم توليد هذه الخطة باستخدام تطبيق DBS Diet Plan</p>
        <p>تذكر أن تستشر طبيبك أو أخصائي تغذية قبل اتباع أي خطة غذائية</p>
      </div>
    </body>
    </html>
  `;
}