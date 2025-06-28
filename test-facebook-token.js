import fetch from 'node-fetch';

async function testFacebookToken() {
  console.log('🧪 اختبار Facebook Access Token...');
  console.log('=' .repeat(60));
  
  const accessToken = 'EAAUpPO0SIEABOz5LAiKQHLRK6ZCRxh5vrdzZAjWCnAD3uMZCg9nWOio7UaPSxbU2Or9Ae3fEL9wa1VIbQG5D99uTQRMcqQLVQu8CqJ0B68wwcQECIAFaNSP4L4Pa29wcYW0GAOM4aB7MUe6vViCc55KLaqlYg5QpBq9xwxZB8OSeWIXJfx1PV0MN8SXC9Bob3oZCtZAQShm6YN8Lo5US8Nuw0LswZDZD';
  const pageId = '351400718067673';
  const customerId = '30517453841172195';
  
  try {
    // 1. اختبار معلومات الصفحة
    console.log('📄 1. اختبار معلومات الصفحة...');
    const pageResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}?access_token=${accessToken}`);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.log('❌ خطأ في معلومات الصفحة:', pageData.error);
    } else {
      console.log('✅ معلومات الصفحة صحيحة:');
      console.log(`   📛 الاسم: ${pageData.name}`);
      console.log(`   🆔 المعرف: ${pageData.id}`);
    }
    
    // 2. اختبار صلاحيات الصفحة
    console.log('\n🔐 2. اختبار صلاحيات الصفحة...');
    const permissionsResponse = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${accessToken}`);
    const permissionsData = await permissionsResponse.json();
    
    if (permissionsData.error) {
      console.log('❌ خطأ في الصلاحيات:', permissionsData.error);
    } else {
      console.log('✅ الصلاحيات المتاحة:');
      permissionsData.data.forEach(perm => {
        console.log(`   ${perm.status === 'granted' ? '✅' : '❌'} ${perm.permission}`);
      });
    }
    
    // 3. اختبار إرسال رسالة
    console.log('\n📨 3. اختبار إرسال رسالة...');
    const messagePayload = {
      recipient: { id: customerId },
      message: { text: 'اختبار الاتصال - هذه رسالة تجريبية من النظام' }
    };
    
    const sendResponse = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.log('❌ خطأ في إرسال الرسالة:');
      console.log(`   🔢 الكود: ${sendData.error.code}`);
      console.log(`   📝 الرسالة: ${sendData.error.message}`);
      console.log(`   🔍 النوع: ${sendData.error.type}`);
      console.log(`   🆔 Sub Code: ${sendData.error.error_subcode || 'غير محدد'}`);
      
      // تحليل نوع الخطأ
      if (sendData.error.code === 100) {
        if (sendData.error.error_subcode === 2018001) {
          console.log('\n🔍 تحليل الخطأ:');
          console.log('   ❌ المشكلة: لم يتم العثور على مستخدم مطابق');
          console.log('   💡 السبب المحتمل: العميل لم يبدأ محادثة مع الصفحة مؤخراً');
          console.log('   🔧 الحل: العميل يجب أن يرسل رسالة للصفحة أولاً');
        } else if (sendData.error.error_subcode === 2018109) {
          console.log('\n🔍 تحليل الخطأ:');
          console.log('   ❌ المشكلة: انتهت صلاحية النافذة الزمنية للرد');
          console.log('   💡 السبب: مرت أكثر من 24 ساعة على آخر رسالة من العميل');
          console.log('   🔧 الحل: العميل يجب أن يرسل رسالة جديدة');
        } else {
          console.log('\n🔍 تحليل الخطأ:');
          console.log('   ❌ خطأ OAuth عام');
          console.log('   💡 قد يكون Access Token منتهي الصلاحية أو غير صحيح');
        }
      }
    } else {
      console.log('✅ تم إرسال الرسالة بنجاح!');
      console.log(`   📨 معرف الرسالة: ${sendData.message_id}`);
    }
    
    // 4. اختبار معلومات العميل
    console.log('\n👤 4. اختبار معلومات العميل...');
    const customerResponse = await fetch(`https://graph.facebook.com/v21.0/${customerId}?access_token=${accessToken}`);
    const customerData = await customerResponse.json();
    
    if (customerData.error) {
      console.log('❌ خطأ في معلومات العميل:', customerData.error.message);
    } else {
      console.log('✅ معلومات العميل متاحة:');
      console.log(`   📛 الاسم: ${customerData.name || 'غير متاح'}`);
      console.log(`   🆔 المعرف: ${customerData.id}`);
    }
    
    // 5. فحص آخر محادثة
    console.log('\n💬 5. فحص آخر محادثة...');
    const conversationResponse = await fetch(`https://graph.facebook.com/v21.0/me/conversations?access_token=${accessToken}`);
    const conversationData = await conversationResponse.json();
    
    if (conversationData.error) {
      console.log('❌ خطأ في المحادثات:', conversationData.error.message);
    } else {
      console.log('✅ المحادثات متاحة:');
      console.log(`   📊 عدد المحادثات: ${conversationData.data?.length || 0}`);
      
      if (conversationData.data && conversationData.data.length > 0) {
        const lastConversation = conversationData.data[0];
        console.log(`   🕐 آخر محادثة: ${lastConversation.updated_time}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 انتهى اختبار Facebook Access Token');
}

testFacebookToken();
