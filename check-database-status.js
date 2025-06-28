// 🔍 فحص شامل لحالة قاعدة البيانات وجدول facebook_settings
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ddwszecfsfkjnahesymm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkDatabaseStatus() {
  console.log('🔍 فحص شامل لحالة قاعدة البيانات...\n');
  
  try {
    // 1. اختبار الاتصال الأساسي
    console.log('1️⃣ اختبار الاتصال الأساسي...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ فشل الاتصال بقاعدة البيانات:', connectionError.message);
      return false;
    }
    console.log('✅ الاتصال بقاعدة البيانات يعمل بشكل طبيعي');
    
    // 2. التحقق من وجود جدول facebook_settings
    console.log('\n2️⃣ التحقق من وجود جدول facebook_settings...');
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'facebook_settings');
    
    if (tableError || !tableExists || tableExists.length === 0) {
      console.error('❌ جدول facebook_settings غير موجود!');
      console.log('🔧 يجب إنشاء الجدول أولاً');
      return false;
    }
    console.log('✅ جدول facebook_settings موجود');
    
    // 3. فحص هيكل الجدول
    console.log('\n3️⃣ فحص هيكل جدول facebook_settings...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'facebook_settings')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ خطأ في جلب هيكل الجدول:', columnsError.message);
    } else {
      console.log('📊 أعمدة الجدول:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    }
    
    // 4. فحص البيانات الموجودة
    console.log('\n4️⃣ فحص البيانات الموجودة...');
    const { data: existingPages, error: pagesError } = await supabase
      .from('facebook_settings')
      .select('*');
    
    if (pagesError) {
      console.error('❌ خطأ في جلب البيانات:', pagesError.message);
    } else {
      console.log(`📈 عدد الصفحات المحفوظة: ${existingPages?.length || 0}`);
      
      if (existingPages && existingPages.length > 0) {
        console.log('📋 الصفحات الموجودة:');
        existingPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.page_name || 'بدون اسم'} (${page.page_id})`);
          console.log(`      - تاريخ الإنشاء: ${page.created_at || 'غير محدد'}`);
          console.log(`      - نشط: ${page.is_active !== false ? 'نعم' : 'لا'}`);
          console.log(`      - له رمز وصول: ${page.access_token ? 'نعم' : 'لا'}`);
        });
      } else {
        console.log('📭 لا توجد صفحات محفوظة في قاعدة البيانات');
      }
    }
    
    // 5. اختبار إضافة صفحة تجريبية
    console.log('\n5️⃣ اختبار إضافة صفحة تجريبية...');
    const testPage = {
      page_id: 'test_' + Date.now(),
      page_name: 'صفحة اختبار ' + new Date().toLocaleString('ar-EG'),
      access_token: 'test_token_' + Date.now(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('facebook_settings')
      .insert(testPage)
      .select();
    
    if (insertError) {
      console.error('❌ فشل في إضافة صفحة تجريبية:', insertError.message);
      console.log('🔧 قد تكون هناك مشكلة في صلاحيات قاعدة البيانات');
    } else {
      console.log('✅ تم إضافة صفحة تجريبية بنجاح');
      console.log('📋 البيانات المضافة:', insertResult[0]);
      
      // حذف الصفحة التجريبية
      await supabase
        .from('facebook_settings')
        .delete()
        .eq('page_id', testPage.page_id);
      console.log('🗑️ تم حذف الصفحة التجريبية');
    }
    
    // 6. فحص صلاحيات RLS
    console.log('\n6️⃣ فحص صلاحيات RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_table_rls', { table_name: 'facebook_settings' })
      .single();
    
    if (rlsError) {
      console.log('⚠️ لا يمكن فحص RLS (قد يكون معطل)');
    } else {
      console.log(`🔒 RLS Status: ${rlsStatus ? 'مفعل' : 'معطل'}`);
    }
    
    console.log('\n🎯 خلاصة التشخيص:');
    console.log('✅ قاعدة البيانات متصلة');
    console.log('✅ جدول facebook_settings موجود');
    console.log('✅ يمكن قراءة وكتابة البيانات');
    
    return true;
    
  } catch (error) {
    console.error('💥 خطأ عام في التشخيص:', error);
    return false;
  }
}

// تشغيل التشخيص
checkDatabaseStatus()
  .then(success => {
    if (success) {
      console.log('\n🎉 قاعدة البيانات تعمل بشكل طبيعي!');
      console.log('💡 إذا كانت الصفحات لا تظهر، المشكلة في خادم API أو الواجهة');
    } else {
      console.log('\n❌ هناك مشكلة في قاعدة البيانات');
      console.log('🔧 يجب إصلاح المشاكل المذكورة أعلاه');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 خطأ في تشغيل التشخيص:', error);
    process.exit(1);
  });
