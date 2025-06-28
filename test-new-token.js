import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

const newToken = 'EAAUpPO0SIEABOz5LAiKQHLRK6ZCRxh5vrdzZAjWCnAD3uMZCg9nWOio7UaPSxbU2Or9Ae3fEL9wa1VIbQG5D99uTQRMcqQLVQu8CqJ0B68wwcQECIAFaNSP4L4Pa29wcYW0GAOM4aB7MUe6vViCc55KLaqlYg5QpBq9xwxZB8OSeWIXJfx1PV0MN8SXC9Bob3oZCtZAQShm6YN8Lo5US8Nuw0LswZDZD';

async function testAndUpdateToken() {
  try {
    console.log('🔍 اختبار الـ Token الجديد...');
    
    // اختبار الـ Token
    const testResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${newToken}`
    );
    
    const testData = await testResponse.json();
    
    if (testData.error) {
      console.error('❌ الـ Token غير صحيح:', testData.error);
      return;
    }
    
    console.log('✅ الـ Token صحيح');
    console.log('📄 معلومات الصفحة:', {
      name: testData.name,
      id: testData.id,
      category: testData.category
    });
    
    // اختبار الصلاحيات
    console.log('🔍 فحص الصلاحيات...');
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${newToken}`
    );
    
    const permissionsData = await permissionsResponse.json();
    
    if (permissionsData.data) {
      console.log('📋 الصلاحيات المتاحة:');
      permissionsData.data.forEach(perm => {
        console.log(`  - ${perm.permission}: ${perm.status}`);
      });
    }
    
    // البحث عن الشركة 121cx
    console.log('🔍 البحث عن شركة 121cx...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', '121@sdfds.com')
      .single();
    
    if (companyError || !company) {
      console.log('❌ لم يتم العثور على شركة 121cx');
      console.log('🔍 البحث عن جميع الشركات...');
      
      const { data: allCompanies, error: allError } = await supabase
        .from('companies')
        .select('*');
      
      if (allCompanies) {
        console.log('📋 الشركات الموجودة:');
        allCompanies.forEach(comp => {
          console.log(`  - ${comp.name} (${comp.email}) - ID: ${comp.id}`);
        });
      }
      return;
    }
    
    console.log('✅ تم العثور على الشركة:', {
      id: company.id,
      name: company.name,
      email: company.email
    });
    
    // البحث عن الصفحات المرتبطة بالشركة
    console.log('🔍 البحث عن صفحات الشركة...');
    const { data: pages, error: pagesError } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('company_id', company.id);
    
    if (pagesError) {
      console.error('❌ خطأ في البحث عن الصفحات:', pagesError);
      return;
    }
    
    if (!pages || pages.length === 0) {
      console.log('⚠️ لم يتم العثور على صفحات مرتبطة بالشركة 121cx');
      
      // إنشاء صفحة جديدة للشركة
      console.log('🔧 إنشاء صفحة جديدة للشركة...');
      const { data: newPage, error: createError } = await supabase
        .from('facebook_settings')
        .insert({
          page_id: testData.id,
          page_name: testData.name,
          access_token: newToken,
          company_id: company.id,
          is_active: true,
          webhook_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ خطأ في إنشاء الصفحة:', createError);
        return;
      }
      
      console.log('✅ تم إنشاء صفحة جديدة:', {
        page_id: newPage.page_id,
        page_name: newPage.page_name,
        company_id: newPage.company_id
      });
      
    } else {
      console.log('📋 الصفحات الموجودة للشركة:');
      pages.forEach(page => {
        console.log(`  - ${page.page_name} (${page.page_id})`);
      });
      
      // تحديث الـ Token للصفحة الأولى
      const { data: updatedPage, error: updateError } = await supabase
        .from('facebook_settings')
        .update({
          access_token: newToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', pages[0].id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ خطأ في تحديث الـ Token:', updateError);
        return;
      }
      
      console.log('✅ تم تحديث الـ Token بنجاح للصفحة:', {
        page_id: updatedPage.page_id,
        page_name: updatedPage.page_name,
        company_id: updatedPage.company_id
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testAndUpdateToken();
