import fetch from 'node-fetch';

async function testWebhookQuick() {
  console.log('🧪 اختبار سريع للـ Webhook...');
  
  // ضع IP المحلي هنا (بدون / في النهاية)
  const ngrokUrl = 'http://192.168.1.3:3002'; // Local IP URL
  
  if (ngrokUrl === 'https://your-ngrok-url.ngrok.io') {
    console.log('❌ يرجى وضع ngrok URL الصحيح في المتغير ngrokUrl');
    console.log('💡 احصل على URL من نافذة ngrok');
    return;
  }
  
  try {
    // اختبار الـ webhook endpoint
    console.log(`🔍 اختبار: ${ngrokUrl}/webhook`);
    
    const response = await fetch(`${ngrokUrl}/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=your_verify_token`);
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ الـ Webhook يعمل!');
      console.log(`📝 الرد: ${text}`);
      
      // اختبار إرسال رسالة
      console.log('\n📨 اختبار إرسال رسالة...');
      const testMessage = {
        object: 'page',
        entry: [{
          id: '351400718067673',
          time: Date.now(),
          messaging: [{
            sender: { id: '30517453841172195' },
            recipient: { id: '351400718067673' },
            timestamp: Date.now(),
            message: {
              mid: 'test_' + Date.now(),
              text: 'رسالة اختبار من الكود'
            }
          }]
        }]
      };
      
      const webhookResponse = await fetch(`${ngrokUrl}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage)
      });
      
      if (webhookResponse.ok) {
        console.log('✅ تم إرسال رسالة الاختبار بنجاح!');
        console.log('📊 راقب logs الخادم لمعرفة النتيجة');
      } else {
        console.log('❌ فشل إرسال رسالة الاختبار:', webhookResponse.status);
      }
      
    } else {
      console.log('❌ الـ Webhook لا يعمل:', response.status);
      const text = await response.text();
      console.log('📝 الرد:', text);
    }
    
  } catch (error) {
    console.log('❌ خطأ في الاختبار:', error.message);
  }
}

testWebhookQuick();
