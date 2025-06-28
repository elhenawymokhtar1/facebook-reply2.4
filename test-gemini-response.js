// اختبار هيكل رد Gemini
async function testGeminiResponse() {
  console.log('🧪 اختبار هيكل رد Gemini...\n');

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=AIzaSyCt9TL-bN7dJmBRFqtns0TseMDe3EYLucs',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'مرحبا، أريد أشوف المنتجات' }] }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📊 هيكل الرد الكامل:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n🔍 تحليل الهيكل:');
    console.log('- candidates موجود:', !!data.candidates);
    console.log('- candidates[0] موجود:', !!data.candidates?.[0]);
    console.log('- content موجود:', !!data.candidates?.[0]?.content);
    console.log('- parts موجود:', !!data.candidates?.[0]?.content?.parts);
    console.log('- parts[0] موجود:', !!data.candidates?.[0]?.content?.parts?.[0]);
    console.log('- text موجود:', !!data.candidates?.[0]?.content?.parts?.[0]?.text);
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log('\n✅ النص المستخرج:');
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.log('\n❌ فشل في استخراج النص');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testGeminiResponse();
