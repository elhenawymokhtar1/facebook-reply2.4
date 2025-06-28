import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGeminiSettings() {
  console.log('🔍 تشخيص إعدادات Gemini AI...');
  console.log('=' .repeat(50));
  
  try {
    // 1. فحص إعدادات Gemini مباشرة
    console.log('🤖 فحص إعدادات Gemini مباشرة...');
    
    const { data: allSettings, error: allError } = await supabase
      .from('gemini_settings')
      .select('*');
    
    console.log('📊 جميع إعدادات Gemini:', allSettings?.length || 0);
    if (allSettings) {
      allSettings.forEach((setting, index) => {
        console.log(`  ${index + 1}. ID: ${setting.id}`);
        console.log(`     مفعل: ${setting.is_enabled}`);
        console.log(`     النموذج: ${setting.model}`);
        console.log(`     لديه API Key: ${!!setting.api_key}`);
        console.log(`     الشركة: ${setting.company_id || 'عام'}`);
      });
    }
    
    // 2. اختبار دالة getGeminiSettings المحدثة
    console.log('\n🔧 اختبار دالة getGeminiSettings المحدثة...');
    
    const { data: enabledSettings, error: enabledError } = await supabase
      .from('gemini_settings')
      .select('*')
      .eq('is_enabled', true)
      .limit(1);
    
    console.log('📋 إعدادات Gemini المفعلة:', enabledSettings?.length || 0);
    if (enabledError) {
      console.error('❌ خطأ في جلب الإعدادات المفعلة:', enabledError);
    }
    
    if (enabledSettings && enabledSettings.length > 0) {
      const setting = enabledSettings[0];
      console.log('✅ تم العثور على إعدادات مفعلة:');
      console.log(`   ID: ${setting.id}`);
      console.log(`   النموذج: ${setting.model}`);
      console.log(`   درجة الحرارة: ${setting.temperature}`);
      console.log(`   الحد الأقصى للرموز: ${setting.max_tokens}`);
      console.log(`   لديه API Key: ${!!setting.api_key}`);
      console.log(`   الشركة: ${setting.company_id || 'عام'}`);
    } else {
      console.log('❌ لم يتم العثور على إعدادات مفعلة');
    }
    
    // 3. محاولة تفعيل الإعدادات إذا لم تكن مفعلة
    if (!enabledSettings || enabledSettings.length === 0) {
      console.log('\n🔧 محاولة تفعيل الإعدادات...');
      
      const { data: updatedSettings, error: updateError } = await supabase
        .from('gemini_settings')
        .update({ is_enabled: true })
        .eq('id', allSettings[0]?.id)
        .select();
      
      if (updateError) {
        console.error('❌ خطأ في تفعيل الإعدادات:', updateError);
      } else {
        console.log('✅ تم تفعيل الإعدادات بنجاح');
      }
    }
    
    // 4. اختبار استدعاء SimpleGeminiService مباشرة
    console.log('\n🧪 اختبار استدعاء SimpleGeminiService مباشرة...');
    
    try {
      // محاكاة استدعاء processMessage
      const testConversationId = '9c3d005a-efb6-444a-9d1a-f719cb42cdd0';
      const testSenderId = '30517453841172195';
      const testMessage = 'اختبار مباشر للنظام';
      
      console.log('📨 معلومات الاختبار:');
      console.log(`   المحادثة: ${testConversationId}`);
      console.log(`   المرسل: ${testSenderId}`);
      console.log(`   الرسالة: ${testMessage}`);
      
      // هنا يمكن استدعاء SimpleGeminiService إذا كان متاحاً
      console.log('💡 لاختبار SimpleGeminiService، يجب تشغيل الخادم');
      
    } catch (serviceError) {
      console.error('❌ خطأ في اختبار SimpleGeminiService:', serviceError);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 ملخص التشخيص:');
    console.log(`📊 إجمالي الإعدادات: ${allSettings?.length || 0}`);
    console.log(`✅ الإعدادات المفعلة: ${enabledSettings?.length || 0}`);
    
    if (enabledSettings && enabledSettings.length > 0) {
      console.log('🎯 النتيجة: إعدادات Gemini جاهزة');
    } else {
      console.log('❌ النتيجة: إعدادات Gemini تحتاج إصلاح');
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

debugGeminiSettings();
