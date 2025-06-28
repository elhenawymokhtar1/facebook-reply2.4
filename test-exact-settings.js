// اختبار Gemini بنفس الإعدادات المستخدمة في النظام
async function testExactSettings() {
  console.log('🧪 اختبار Gemini بنفس الإعدادات المستخدمة في النظام...\n');

  // الإعدادات من قاعدة البيانات
  const settings = {
    api_key: "AIzaSyCt9TL-bN7dJmBRFqtns0TseMDe3EYLucs",
    model: "gemini-2.5-flash-lite-preview-06-17",
    temperature: 0.7,
    max_tokens: 1000
  };

  const prompt = `أنت مساعد ذكي لشركة شركة 121cx

المنتجات المتوفرة حالياً:
🛍️ منتجاتنا المتوفرة:

1. ساعه
   💰 500 ج
   📦 ✅ متوفر

2. كوتشي حريمي
   💰 499 ج
   📦 ✅ متوفر

🌐 المتجر الكامل: /shop
🛒 للطلب المباشر اذكري اسم المنتج!

تاريخ المحادثة الكامل:
العميل: السلام عليكم
المتجر: وعليكم السلام، أهلاً بك في 121cx! كيف يمكنني مساعدتك اليوم؟
العميل: عايز اعرف ايه المنتجات الموجوده

رسالة العميل: مرحبا، أريد أشوف المنتجات
ردك (بإيجاز):`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.api_key}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: settings.temperature,
        maxOutputTokens: Math.min(settings.max_tokens, 300)
      }
    };

    console.log('🔧 URL:', url);
    console.log('🔧 Model:', settings.model);
    console.log('🔧 Temperature:', settings.temperature);
    console.log('🔧 Max tokens:', Math.min(settings.max_tokens, 300));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('📊 Response structure:');
    console.log('- candidates:', !!data.candidates);
    console.log('- candidates[0]:', !!data.candidates?.[0]);
    console.log('- content:', !!data.candidates?.[0]?.content);
    console.log('- parts:', !!data.candidates?.[0]?.content?.parts);
    console.log('- text:', !!data.candidates?.[0]?.content?.parts?.[0]?.text);

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log('\n✅ النص المستخرج:');
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.log('\n❌ فشل في استخراج النص');
      console.log('📊 Full response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testExactSettings();
