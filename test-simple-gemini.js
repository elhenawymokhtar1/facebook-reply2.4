// اختبار مباشر لخدمة Gemini
import { SimpleGeminiService } from './src/services/simpleGeminiService.ts';

async function testSimpleGemini() {
  console.log('🧪 اختبار مباشر لخدمة Gemini...\n');

  try {
    console.log('🚀 استدعاء SimpleGeminiService.processMessage مباشرة...');
    
    const result = await SimpleGeminiService.processMessage(
      'مرحبا، أريد أشوف المنتجات',
      '7edcbc3c-9364-4c38-aa18-5fb5ef4b0cd7',
      '121cx_test_user_final',
      '260345600493273'
    );

    console.log('📊 نتيجة المعالجة:', result);

  } catch (error) {
    console.error('❌ خطأ في الاختبار المباشر:', error);
    console.error('📄 تفاصيل الخطأ:', error.stack);
  }
}

testSimpleGemini();
