// اختبار خدمة Gemini مباشرة
import { SimpleGeminiService } from './src/services/simpleGeminiService.js';

async function testGeminiServiceDirect() {
  console.log('🧪 اختبار خدمة Gemini مباشرة...\n');

  try {
    const result = await SimpleGeminiService.processMessage(
      "مرحبا، أريد أشوف المنتجات",
      "9c3d005a-efb6-444a-9d1a-f719cb42cdd0",
      "30517453841172195",
      "351400718067673"
    );

    console.log('📊 نتيجة المعالجة:', result);

    if (result) {
      console.log('✅ الخدمة تعمل بنجاح!');
    } else {
      console.log('❌ الخدمة فشلت');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testGeminiServiceDirect();
