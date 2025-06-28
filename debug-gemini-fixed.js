import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGeminiFixed() {
  console.log('🔍 تشخيص مشكلة رسائل Gemini AI (محدث)...');
  console.log('=' .repeat(50));
  
  try {
    // 1. فحص رسائل البوت
    console.log('🤖 فحص رسائل Gemini AI...');
    
    const { data: botMessages, error: botError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(
          customer_name,
          page_id,
          user_id,
          companies(name)
        )
      `)
      .eq('sender_type', 'bot')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (botError) {
      console.error('❌ خطأ في جلب رسائل البوت:', botError);
      
      // محاولة بدون user_id
      const { data: botMessages2, error: botError2 } = await supabase
        .from('messages')
        .select(`
          *,
          conversations(
            customer_name,
            page_id,
            companies(name)
          )
        `)
        .eq('sender_type', 'bot')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (botError2) {
        console.error('❌ خطأ في الاستعلام البديل:', botError2);
        return;
      }
      
      console.log('✅ استخدام الاستعلام البديل...');
      await analyzeMessages(botMessages2);
      
    } else {
      await analyzeMessages(botMessages);
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

async function analyzeMessages(botMessages) {
  console.log(`📊 آخر ${botMessages.length} رسائل من البوت:`);
  
  for (const msg of botMessages) {
    const companyName = msg.conversations?.companies?.name || 'غير محدد';
    const customerName = msg.conversations?.customer_name || 'غير محدد';
    const pageId = msg.conversations?.page_id;
    const userId = msg.conversations?.user_id;
    
    console.log(`\n🤖 رسالة البوت:`);
    console.log(`   المحتوى: ${msg.content?.substring(0, 100)}...`);
    console.log(`   العميل: ${customerName}`);
    console.log(`   الشركة: ${companyName}`);
    console.log(`   الصفحة: ${pageId}`);
    console.log(`   معرف المستخدم: ${userId || 'غير محدد'}`);
    console.log(`   التاريخ: ${msg.created_at}`);
    
    // البحث عن معرف المستخدم من المحادثة
    if (!userId && msg.conversation_id) {
      console.log(`   🔍 البحث عن معرف المستخدم...`);
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', msg.conversation_id)
        .single();
      
      if (conversation) {
        console.log(`   📋 تفاصيل المحادثة:`, {
          id: conversation.id,
          customer_name: conversation.customer_name,
          page_id: conversation.page_id,
          user_id: conversation.user_id || 'غير محدد'
        });
        
        // البحث في الرسائل عن معرف المستخدم
        const { data: customerMessages, error: custError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('conversation_id', msg.conversation_id)
          .eq('sender_type', 'customer')
          .not('sender_id', 'is', null)
          .limit(1);
        
        if (customerMessages && customerMessages.length > 0) {
          const realUserId = customerMessages[0].sender_id;
          console.log(`   ✅ تم العثور على معرف المستخدم: ${realUserId}`);
          
          // اختبار إرسال رسالة
          await testSendMessage(pageId, realUserId, companyName);
        } else {
          console.log(`   ❌ لم يتم العثور على معرف المستخدم`);
        }
      }
    } else if (userId) {
      // اختبار إرسال رسالة
      await testSendMessage(pageId, userId, companyName);
    }
  }
}

async function testSendMessage(pageId, userId, companyName) {
  if (!pageId || !userId) {
    console.log(`   ⚠️ معلومات الإرسال غير مكتملة`);
    return;
  }
  
  console.log(`   🧪 اختبار إرسال الرسالة...`);
  
  // جلب Facebook Token للصفحة
  const { data: pageSettings, error: pageError } = await supabase
    .from('facebook_settings')
    .select('access_token, page_name')
    .eq('page_id', pageId)
    .single();
  
  if (pageError || !pageSettings) {
    console.log(`   ❌ لم يتم العثور على إعدادات الصفحة`);
    return;
  }
  
  // محاولة إرسال رسالة اختبار
  const testMessage = {
    recipient: { id: userId },
    message: { text: `🧪 اختبار إرسال رسائل Gemini AI - ${new Date().toLocaleTimeString('ar-EG')}` }
  };
  
  try {
    const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageSettings.access_token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.log(`   ❌ فشل الإرسال: ${sendData.error.message}`);
      console.log(`   📄 الصفحة: ${pageSettings.page_name} (${companyName})`);
      console.log(`   🔑 كود الخطأ: ${sendData.error.code}`);
      
      // تفاصيل إضافية عن الخطأ
      if (sendData.error.code === 10) {
        console.log(`   💡 السبب: المستخدم لم يرسل رسالة للصفحة خلال آخر 24 ساعة`);
        console.log(`   🔧 الحل: المستخدم يحتاج لإرسال رسالة جديدة أولاً`);
      } else if (sendData.error.code === 200) {
        console.log(`   💡 السبب: مشكلة في صلاحيات pages_messaging`);
        console.log(`   🔧 الحل: تحديث صلاحيات Facebook Token`);
      } else if (sendData.error.code === 190) {
        console.log(`   💡 السبب: Facebook Access Token منتهي الصلاحية`);
        console.log(`   🔧 الحل: تجديد Facebook Token`);
      } else if (sendData.error.code === 100) {
        console.log(`   💡 السبب: معرف المستخدم غير صحيح أو الصفحة غير موجودة`);
        console.log(`   🔧 الحل: التحقق من معرف المستخدم ومعرف الصفحة`);
      }
    } else {
      console.log(`   ✅ تم الإرسال بنجاح: ${sendData.message_id}`);
      console.log(`   📄 الصفحة: ${pageSettings.page_name} (${companyName})`);
    }
    
  } catch (error) {
    console.log(`   ❌ خطأ في الاتصال: ${error.message}`);
  }
}

debugGeminiFixed();
