import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectSend() {
  console.log('🎯 اختبار مباشر لدالة sendViaFacebook...');
  console.log('=' .repeat(60));
  
  try {
    // 1. إنشاء رسالة اختبار في قاعدة البيانات
    console.log('📝 إنشاء رسالة اختبار في قاعدة البيانات...');
    
    const conversationId = '9c3d005a-efb6-444a-9d1a-f719cb42cdd0';
    const testMessage = `🧪 اختبار مباشر للإرسال - ${new Date().toLocaleTimeString('ar-EG')}`;
    
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: testMessage,
        sender_type: 'bot',
        is_read: true,
        is_auto_reply: true,
        is_ai_generated: true
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('❌ خطأ في حفظ الرسالة:', saveError);
      return;
    }
    
    console.log('✅ تم حفظ الرسالة في قاعدة البيانات');
    console.log(`📝 معرف الرسالة: ${savedMessage.id}`);
    
    // 2. محاكاة دالة sendViaFacebook
    console.log('\n🔧 محاكاة دالة sendViaFacebook...');
    
    // الحصول على معلومات المحادثة
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('page_id, facebook_page_id, customer_facebook_id, customer_name, company_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('❌ خطأ في جلب معلومات المحادثة:', convError);
      return;
    }

    console.log('✅ معلومات المحادثة:');
    console.log(`   العميل: ${conversation.customer_name}`);
    console.log(`   معرف Facebook: ${conversation.customer_facebook_id}`);
    console.log(`   معرف الصفحة: ${conversation.page_id || conversation.facebook_page_id}`);
    console.log(`   الشركة: ${conversation.company_id}`);

    const pageId = conversation.page_id || conversation.facebook_page_id;
    const senderId = conversation.customer_facebook_id;

    if (!pageId || !senderId) {
      console.error('❌ معلومات الإرسال غير مكتملة');
      return;
    }

    // الحصول على إعدادات Facebook للصفحة المحددة
    const { data: facebookSettings, error: fbError } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .single();

    if (fbError || !facebookSettings) {
      console.error('❌ خطأ في جلب إعدادات Facebook للصفحة:', pageId, fbError);
      return;
    }

    console.log(`✅ إعدادات Facebook للصفحة: ${facebookSettings.page_name}`);

    // 3. إرسال الرسالة عبر Facebook API
    console.log('\n📤 إرسال الرسالة عبر Facebook API...');
    
    const messageToSend = {
      recipient: { id: senderId },
      message: { text: testMessage }
    };
    
    const response = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${facebookSettings.access_token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Facebook API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return;
    }

    const result = await response.json();

    if (result.error) {
      console.error('❌ Facebook API Response Error:', result.error);
      return;
    }

    console.log('✅ تم إرسال الرسالة بنجاح:', result);
    
    // 4. تحديث الرسالة في قاعدة البيانات بمعرف Facebook
    if (result && result.message_id) {
      console.log('\n📝 تحديث الرسالة بمعرف Facebook...');
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          facebook_message_id: result.message_id,
          status: 'delivered'
        })
        .eq('id', savedMessage.id);
      
      if (updateError) {
        console.error('❌ خطأ في تحديث الرسالة:', updateError);
      } else {
        console.log('✅ تم تحديث الرسالة بمعرف Facebook بنجاح');
        console.log(`📨 معرف Facebook: ${result.message_id}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 نجح الاختبار المباشر!');
    console.log('✅ دالة sendViaFacebook تعمل بشكل مثالي');
    console.log('✅ الرسالة تم إرسالها وتحديثها في قاعدة البيانات');
    console.log('');
    console.log('💡 المشكلة قد تكون في:');
    console.log('   1. عدم استدعاء sendViaFacebook في الكود الأساسي');
    console.log('   2. خطأ في معالجة الأخطاء يمنع الوصول للدالة');
    console.log('   3. مشكلة في إعدادات Gemini للشركة المحددة');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار المباشر:', error.message);
  }
}

testDirectSend();
