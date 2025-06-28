// 🔍 فحص استجابة API للصفحات
import fetch from 'node-fetch';

async function checkApiResponse() {
  try {
    console.log('🔍 فحص استجابة API للصفحات...\n');
    
    const companyId = 'ac1eea64-6240-4c15-9cf1-569560fafb54';
    const url = `http://localhost:8081/api/facebook/settings?company_id=${companyId}`;
    
    console.log('📡 URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ استجابة API:');
    console.log('📊 عدد الصفحات:', data.length);
    
    if (data.length > 0) {
      data.forEach((page, index) => {
        console.log(`\n📄 الصفحة ${index + 1}:`);
        console.log(`   🆔 ID: ${page.page_id}`);
        console.log(`   📝 الاسم: ${page.page_name}`);
        console.log(`   🏢 الشركة: ${page.company_id}`);
        console.log(`   ✅ نشطة: ${page.is_active ? 'نعم' : 'لا'}`);
        console.log(`   🔑 لديها Token: ${page.access_token ? 'نعم' : 'لا'}`);
      });
    } else {
      console.log('📭 لا توجد صفحات');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص API:', error.message);
  }
}

checkApiResponse();
