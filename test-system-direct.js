// اختبار النظام مباشرة
async function testSystemDirect() {
  console.log('🧪 اختبار النظام مباشرة...\n');

  try {
    const response = await fetch('http://localhost:3002/api/gemini/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: "30517453841172195",
        messageText: "مرحبا، أريد أشوف المنتجات",
        pageId: "351400718067673",
        conversationId: "9c3d005a-efb6-444a-9d1a-f719cb42cdd0"
      })
    });

    console.log('📊 حالة الاستجابة:', response.status);
    console.log('📊 نوع المحتوى:', response.headers.get('content-type'));

    const data = await response.json();
    console.log('📊 رد النظام:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ النظام يعمل بنجاح!');
    } else {
      console.log('❌ النظام فشل:', data.message);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testSystemDirect();
