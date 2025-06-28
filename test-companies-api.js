// اختبار API الشركات
const fetch = require('node-fetch');

async function testCompaniesAPI() {
  try {
    console.log('🧪 اختبار API الشركات...');
    
    const response = await fetch('http://localhost:3002/api/subscriptions/admin/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 حالة الاستجابة:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ نجح الطلب!');
      console.log('📋 عدد الشركات:', result.data ? result.data.length : 0);
      
      if (result.data && result.data.length > 0) {
        console.log('🏢 أول شركة:', {
          id: result.data[0].id,
          name: result.data[0].name,
          email: result.data[0].email,
          status: result.data[0].status
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ فشل الطلب:', errorText);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testCompaniesAPI();
