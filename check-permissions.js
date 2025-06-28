import fetch from 'node-fetch';

const token = 'EAAUpPO0SIEABOz5LAiKQHLRK6ZCRxh5vrdzZAjWCnAD3uMZCg9nWOio7UaPSxbU2Or9Ae3fEL9wa1VIbQG5D99uTQRMcqQLVQu8CqJ0B68wwcQECIAFaNSP4L4Pa29wcYW0GAOM4aB7MUe6vViCc55KLaqlYg5QpBq9xwxZB8OSeWIXJfx1PV0MN8SXC9Bob3oZCtZAQShm6YN8Lo5US8Nuw0LswZDZD';

async function checkPermissions() {
  try {
    console.log('🔍 فحص صلاحيات الـ Token...');
    
    const response = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ خطأ:', data.error);
      return;
    }
    
    console.log('📋 الصلاحيات المتاحة:');
    const permissions = data.data || [];
    
    const requiredPermissions = [
      'pages_messaging',
      'pages_read_engagement', 
      'pages_manage_metadata',
      'pages_show_list'
    ];
    
    permissions.forEach(perm => {
      const isRequired = requiredPermissions.includes(perm.permission);
      const status = perm.status === 'granted' ? '✅' : '❌';
      const required = isRequired ? '(مطلوب)' : '';
      console.log(`  ${status} ${perm.permission}: ${perm.status} ${required}`);
    });
    
    console.log('\n🔍 فحص الصلاحيات المطلوبة:');
    requiredPermissions.forEach(reqPerm => {
      const found = permissions.find(p => p.permission === reqPerm);
      if (found) {
        const status = found.status === 'granted' ? '✅' : '❌';
        console.log(`  ${status} ${reqPerm}: ${found.status}`);
      } else {
        console.log(`  ❌ ${reqPerm}: غير موجود`);
      }
    });
    
    // اختبار إرسال رسالة
    console.log('\n🧪 اختبار إرسال رسالة تجريبية...');
    const testMessage = {
      recipient: { id: '30517453841172195' }, // معرف المستخدم من الـ logs
      message: { text: 'رسالة اختبار من النظام الجديد! 🎉' }
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
    } else {
      console.log('✅ تم إرسال الرسالة التجريبية بنجاح!');
      console.log('📨 معرف الرسالة:', sendData.message_id);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

checkPermissions();
