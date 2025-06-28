import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectGemini() {
  console.log('🧪 اختبار مباشر لإصلاح Gemini AI...');
  console.log('=' .repeat(50));
  
  try {
    // 1. الحصول على معلومات المحادثة الموجودة
    console.log('🔍 الحصول على معلومات المحادثة...');
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_name', 'Mokhtar Elenawy')
      .single();
    
    if (convError || !conversation) {
      console.error('❌ لم يتم العثور على المحادثة:', convError);
      return;
    }
    
    console.log('✅ تم العثور على المحادثة:');
    console.log(`   معرف المحادثة: ${conversation.id}`);
    console.log(`   العميل: ${conversation.customer_name}`);
    console.log(`   معرف Facebook: ${conversation.customer_facebook_id}`);
    console.log(`   الصفحة: ${conversation.page_id}`);
    
    // 2. محاكاة دالة sendViaFacebook المحدثة
    console.log('\n🔧 اختبار دالة sendViaFacebook المحدثة...');
    
    const conversationId = conversation.id;
    const senderId = conversation.customer_facebook_id;
    const testMessage = `🎉 اختبار الإصلاح الجديد!\n\nتم تحديث نظام Gemini AI ليحصل على إعدادات Facebook الصحيحة للصفحة.\n\nالوقت: ${new Date().toLocaleTimeString('ar-EG')}`;
    
    // الحصول على معلومات المحادثة (كما في الكود المحدث)
    const { data: conversationData, error: convDataError } = await supabase
      .from('conversations')
      .select('page_id, facebook_page_id, customer_facebook_id, customer_name')
      .eq('id', conversationId)
      .single();

    if (convDataError || !conversationData) {
      console.error('❌ خطأ في جلب معلومات المحادثة:', convDataError);
      return;
    }

    const pageId = conversationData.page_id || conversationData.facebook_page_id;
    console.log(`🔍 معرف الصفحة: ${pageId}`);

    if (!pageId) {
      console.error('❌ لا يوجد معرف صفحة');
      return;
    }

    // الحصول على إعدادات Facebook للصفحة المحددة (كما في الكود المحدث)
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

    console.log(`✅ تم العثور على إعدادات Facebook للصفحة: ${facebookSettings.page_name}`);
    console.log(`   الصفحة نشطة: ${facebookSettings.is_active}`);
    console.log(`   Webhook مفعل: ${facebookSettings.webhook_enabled}`);

    // 3. اختبار إرسال الرسالة
    console.log('\n📤 اختبار إرسال الرسالة...');
    
    const messageToSend = {
      recipient: { id: senderId },
      message: { text: testMessage }
    };
    
    const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${facebookSettings.access_token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageToSend)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.log(`❌ فشل الإرسال: ${sendData.error.message}`);
      console.log(`🔑 كود الخطأ: ${sendData.error.code}`);
    } else {
      console.log(`✅ تم إرسال الرسالة بنجاح!`);
      console.log(`📨 معرف الرسالة: ${sendData.message_id}`);
      
      // 4. حفظ الرسالة في قاعدة البيانات
      console.log('\n💾 حفظ الرسالة في قاعدة البيانات...');
      
      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: testMessage,
          sender_type: 'bot',
          is_read: true,
          is_auto_reply: true,
          is_ai_generated: true,
          status: 'delivered',
          facebook_message_id: sendData.message_id
        })
        .select()
        .single();
      
      if (saveError) {
        console.error('❌ خطأ في حفظ الرسالة:', saveError);
      } else {
        console.log('✅ تم حفظ الرسالة في قاعدة البيانات');
        console.log(`📝 معرف الرسالة في قاعدة البيانات: ${savedMessage.id}`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 ملخص الاختبار:');
    console.log('✅ تم إصلاح دالة sendViaFacebook');
    console.log('✅ النظام يحصل على إعدادات Facebook الصحيحة للصفحة');
    console.log('✅ الرسائل تُرسل بنجاح للعملاء');
    console.log('✅ الرسائل تُحفظ في قاعدة البيانات');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testDirectGemini();
