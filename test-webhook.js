import fetch from 'node-fetch';

async function testWebhook() {
  console.log('🔍 اختبار Facebook Webhook...');
  console.log('=' .repeat(60));
  
  const accessToken = 'EAAUpPO0SIEABOz5LAiKQHLRK6ZCRxh5vrdzZAjWCnAD3uMZCg9nWOio7UaPSxbU2Or9Ae3fEL9wa1VIbQG5D99uTQRMcqQLVQu8CqJ0B68wwcQECIAFaNSP4L4Pa29wcYW0GAOM4aB7MUe6vViCc55KLaqlYg5QpBq9xwxZB8OSeWIXJfx1PV0MN8SXC9Bob3oZCtZAQShm6YN8Lo5US8Nuw0LswZDZD';
  const pageId = '351400718067673';
  const webhookUrl = 'https://facebook-reply2-1.onrender.com/webhook';
  
  try {
    // 1. فحص إعدادات الـ Webhook الحالية
    console.log('📋 1. فحص إعدادات الـ Webhook الحالية...');
    const webhookResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?access_token=${accessToken}`);
    const webhookData = await webhookResponse.json();
    
    if (webhookData.error) {
      console.log('❌ خطأ في جلب إعدادات الـ Webhook:', webhookData.error);
    } else {
      console.log('✅ إعدادات الـ Webhook:');
      console.log('   📊 عدد التطبيقات المشتركة:', webhookData.data?.length || 0);
      
      if (webhookData.data && webhookData.data.length > 0) {
        webhookData.data.forEach((app, index) => {
          console.log(`   📱 التطبيق ${index + 1}:`);
          console.log(`      🆔 المعرف: ${app.id}`);
          console.log(`      📛 الاسم: ${app.name || 'غير محدد'}`);
        });
      } else {
        console.log('   ⚠️ لا توجد تطبيقات مشتركة في الـ Webhook');
      }
    }
    
    // 2. فحص إعدادات الصفحة
    console.log('\n📄 2. فحص إعدادات الصفحة...');
    const pageResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=name,id,access_token&access_token=${accessToken}`);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.log('❌ خطأ في معلومات الصفحة:', pageData.error);
    } else {
      console.log('✅ معلومات الصفحة:');
      console.log(`   📛 الاسم: ${pageData.name}`);
      console.log(`   🆔 المعرف: ${pageData.id}`);
    }
    
    // 3. اختبار الـ Webhook URL
    console.log('\n🌐 3. اختبار الـ Webhook URL...');
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'GET',
        timeout: 5000
      });
      
      if (testResponse.ok) {
        const responseText = await testResponse.text();
        console.log('✅ الـ Webhook URL يستجيب:');
        console.log(`   📊 الحالة: ${testResponse.status}`);
        console.log(`   📝 الرد: ${responseText.substring(0, 100)}...`);
      } else {
        console.log('❌ الـ Webhook URL لا يستجيب:');
        console.log(`   📊 الحالة: ${testResponse.status}`);
      }
    } catch (urlError) {
      console.log('❌ خطأ في الوصول للـ Webhook URL:', urlError.message);
    }
    
    // 4. فحص الاشتراكات
    console.log('\n📡 4. فحص اشتراكات الـ Webhook...');
    const subscriptionsResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/subscriptions?access_token=${accessToken}`);
    const subscriptionsData = await subscriptionsResponse.json();
    
    if (subscriptionsData.error) {
      console.log('❌ خطأ في جلب الاشتراكات:', subscriptionsData.error);
    } else {
      console.log('✅ اشتراكات الـ Webhook:');
      if (subscriptionsData.data && subscriptionsData.data.length > 0) {
        subscriptionsData.data.forEach((sub, index) => {
          console.log(`   📡 الاشتراك ${index + 1}:`);
          console.log(`      🎯 النوع: ${sub.object}`);
          console.log(`      📋 الحقول: ${sub.fields?.join(', ') || 'غير محدد'}`);
          console.log(`      ✅ نشط: ${sub.active ? 'نعم' : 'لا'}`);
        });
      } else {
        console.log('   ⚠️ لا توجد اشتراكات نشطة');
      }
    }
    
    // 5. محاولة إرسال رسالة اختبار
    console.log('\n📨 5. إرسال رسالة اختبار...');
    const testMessage = {
      recipient: { id: '30517453841172195' },
      message: { text: '🧪 رسالة اختبار الـ Webhook - ' + new Date().toLocaleTimeString('ar-EG') }
    };
    
    const sendResponse = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.log('❌ فشل إرسال رسالة الاختبار:', sendData.error.message);
    } else {
      console.log('✅ تم إرسال رسالة الاختبار بنجاح!');
      console.log(`   📨 معرف الرسالة: ${sendData.message_id}`);
      console.log('   ⏰ انتظر قليلاً لمعرفة إذا وصل الـ Webhook...');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الـ Webhook:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 انتهى اختبار الـ Webhook');
  console.log('💡 راقب logs الخادم لمعرفة إذا وصل الـ Webhook');
}

testWebhook();
