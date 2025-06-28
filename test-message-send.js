import fetch from 'node-fetch';

const token = 'EAAUpPO0SIEABOz5LAiKQHLRK6ZCRxh5vrdzZAjWCnAD3uMZCg9nWOio7UaPSxbU2Or9Ae3fEL9wa1VIbQG5D99uTQRMcqQLVQu8CqJ0B68wwcQECIAFaNSP4L4Pa29wcYW0GAOM4aB7MUe6vViCc55KLaqlYg5QpBq9xwxZB8OSeWIXJfx1PV0MN8SXC9Bob3oZCtZAQShm6YN8Lo5US8Nuw0LswZDZD';

async function testToken() {
  try {
    console.log('🔍 اختبار الـ Token...');
    
    // اختبار معلومات الصفحة
    const pageResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token}`);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ خطأ في الـ Token:', pageData.error);
      return;
    }
    
    console.log('✅ الـ Token صحيح');
    console.log('📄 معلومات الصفحة:', {
      name: pageData.name,
      id: pageData.id,
      category: pageData.category
    });
    
    // اختبار إرسال رسالة
    console.log('\n🧪 اختبار إرسال رسالة تجريبية...');
    const testMessage = {
      recipient: { id: '30517453841172195' }, // معرف المستخدم من الـ logs
      message: { text: 'رسالة اختبار من النظام الجديد! 🎉\n\nتم تحديث الـ Token بنجاح والنظام يعمل الآن!' }
    };
    
    const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.error('❌ خطأ في إرسال الرسالة:', sendData.error);
      
      // تفاصيل إضافية عن الخطأ
      if (sendData.error.code === 10) {
        console.log('💡 الحل: تأكد من أن المستخدم أرسل رسالة للصفحة أولاً');
      } else if (sendData.error.code === 200) {
        console.log('💡 الحل: تأكد من صلاحيات pages_messaging');
      }
    } else {
      console.log('✅ تم إرسال الرسالة التجريبية بنجاح!');
      console.log('📨 معرف الرسالة:', sendData.message_id);
    }
    
    // اختبار الوصول لمعلومات إضافية
    console.log('\n🔍 اختبار الوصول لمعلومات الصفحة...');
    const fieldsResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,category,access_token&access_token=${token}`);
    const fieldsData = await fieldsResponse.json();
    
    if (fieldsData.error) {
      console.error('❌ خطأ في جلب المعلومات:', fieldsData.error);
    } else {
      console.log('✅ معلومات إضافية:', fieldsData);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testToken();
