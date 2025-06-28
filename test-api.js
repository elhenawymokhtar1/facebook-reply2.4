import fetch from 'node-fetch';

async function testAPI() {
  try {
    const companyId = 'a7854ed7-f421-485b-87b4-7829fddf82c3';
    const response = await fetch(`http://localhost:3002/api/facebook/conversations?company_id=${companyId}`);
    const data = await response.json();
    
    console.log('🔍 نتيجة API:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testAPI();
