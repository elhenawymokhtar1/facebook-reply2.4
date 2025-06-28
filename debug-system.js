// تشخيص مشكلة النظام
console.log('🔍 بدء تشخيص النظام...');

// محاولة استيراد الخدمة مباشرة
async function debugSystem() {
  try {
    console.log('📦 محاولة استيراد الخدمة...');

    // استيراد الخدمة
    const { SimpleGeminiService } = await import('./src/services/simpleGeminiService.js');
    console.log('✅ تم استيراد الخدمة بنجاح');

    // اختبار الخدمة
    console.log('🧪 اختبار الخدمة...');
    const result = await SimpleGeminiService.processMessage(
      "مرحبا، أريد أشوف المنتجات",
      "9c3d005a-efb6-444a-9d1a-f719cb42cdd0",
      "30517453841172195",
      "351400718067673"
    );

    console.log('📊 نتيجة الاختبار:', result);

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
    console.error('📊 تفاصيل الخطأ:', error.stack);
  }
}

debugSystem();