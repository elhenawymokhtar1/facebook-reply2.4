import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMessageDelivery() {
  console.log('🔍 تشخيص مشكلة توصيل رسائل Gemini AI...');
  console.log('=' .repeat(50));
  
  try {
    // 1. البحث عن آخر رسالة من البوت
    console.log('🤖 البحث عن آخر رسالة من Gemini AI...');
    
    const { data: latestBotMessage, error: botError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(
          customer_name,
          customer_facebook_id,
          page_id,
          company_id,
          companies(name)
        )
      `)
      .eq('sender_type', 'bot')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (botError) {
      console.error('❌ خطأ في جلب رسالة البوت:', botError);
      return;
    }
    
    if (!latestBotMessage) {
      console.log('⚠️ لم يتم العثور على رسائل من البوت');
      return;
    }
    
    console.log('📨 آخر رسالة من Gemini AI:');
    console.log(`   المحتوى: ${latestBotMessage.content}`);
    console.log(`   العميل: ${latestBotMessage.conversations?.customer_name}`);
    console.log(`   الشركة: ${latestBotMessage.conversations?.companies?.name}`);
    console.log(`   التاريخ: ${latestBotMessage.created_at}`);
    console.log(`   معرف المحادثة: ${latestBotMessage.conversation_id}`);
    
    const conversation = latestBotMessage.conversations;
    const userId = conversation?.customer_facebook_id;
    const pageId = conversation?.page_id;
    
    if (!userId) {
      console.log('❌ معرف المستخدم مفقود');
      return;
    }
    
    if (!pageId) {
      console.log('❌ معرف الصفحة مفقود');
      return;
    }
    
    console.log(`   معرف المستخدم: ${userId}`);
    console.log(`   معرف الصفحة: ${pageId}`);
    
    // 2. جلب إعدادات Facebook للصفحة
    console.log('\n🔑 جلب إعدادات Facebook...');
    
    const { data: pageSettings, error: pageError } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('page_id', pageId)
      .single();
    
    if (pageError || !pageSettings) {
      console.error('❌ لم يتم العثور على إعدادات الصفحة:', pageError);
      return;
    }
    
    console.log(`✅ إعدادات الصفحة: ${pageSettings.page_name}`);
    console.log(`   نشط: ${pageSettings.is_active}`);
    console.log(`   Webhook: ${pageSettings.webhook_enabled}`);
    
    // 3. اختبار Facebook Token
    console.log('\n🧪 اختبار Facebook Token...');
    
    try {
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${pageSettings.access_token}`);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.log(`❌ Token غير صحيح: ${tokenData.error.message}`);
        return;
      } else {
        console.log(`✅ Token صحيح للصفحة: ${tokenData.name}`);
      }
    } catch (error) {
      console.log(`❌ خطأ في اختبار Token: ${error.message}`);
      return;
    }
    
    // 4. محاولة إعادة إرسال الرسالة
    console.log('\n📤 محاولة إعادة إرسال الرسالة...');
    
    const messageToSend = {
      recipient: { id: userId },
      message: { text: latestBotMessage.content }
    };
    
    try {
      const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageSettings.access_token}`, {
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
        console.log(`🔍 تفاصيل الخطأ:`, sendData.error);
        
        // تحليل أسباب الفشل
        if (sendData.error.code === 10) {
          console.log('\n💡 السبب: المستخدم لم يرسل رسالة خلال آخر 24 ساعة');
          console.log('🔧 الحل: المستخدم يحتاج لإرسال رسالة جديدة أولاً');
          
          // إرسال رسالة ترحيب بدلاً من ذلك
          await sendWelcomeMessage(pageSettings.access_token, userId);
          
        } else if (sendData.error.code === 200) {
          console.log('\n💡 السبب: مشكلة في صلاحيات pages_messaging');
          console.log('🔧 الحل: تحديث صلاحيات Facebook Token');
          
        } else if (sendData.error.code === 190) {
          console.log('\n💡 السبب: Facebook Token منتهي الصلاحية');
          console.log('🔧 الحل: تجديد Facebook Token');
          
        } else if (sendData.error.code === 100) {
          console.log('\n💡 السبب: معرف المستخدم أو الصفحة غير صحيح');
          console.log('🔧 الحل: التحقق من المعرفات');
        }
        
      } else {
        console.log(`✅ تم إرسال الرسالة بنجاح!`);
        console.log(`📨 معرف الرسالة: ${sendData.message_id}`);
        
        // تحديث حالة الرسالة في قاعدة البيانات
        await supabase
          .from('messages')
          .update({ 
            status: 'delivered',
            facebook_message_id: sendData.message_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', latestBotMessage.id);
        
        console.log('✅ تم تحديث حالة الرسالة في قاعدة البيانات');
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الإرسال: ${error.message}`);
    }
    
    // 5. فحص آلية الإرسال في الكود
    console.log('\n🔍 فحص آلية الإرسال في النظام...');
    await checkSendingMechanism();
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

async function sendWelcomeMessage(accessToken, userId) {
  console.log('\n📨 إرسال رسالة ترحيب...');
  
  const welcomeMessage = {
    recipient: { id: userId },
    message: { 
      text: `مرحباً! 👋\n\nلاحظت أنك تواصلت معنا مؤخراً. نظام Gemini AI جاهز للمساعدة!\n\nأرسل أي رسالة وستحصل على رد فوري. 🤖✨` 
    }
  };
  
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(welcomeMessage)
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ فشل إرسال رسالة الترحيب: ${data.error.message}`);
    } else {
      console.log(`✅ تم إرسال رسالة الترحيب بنجاح: ${data.message_id}`);
    }
    
  } catch (error) {
    console.log(`❌ خطأ في إرسال رسالة الترحيب: ${error.message}`);
  }
}

async function checkSendingMechanism() {
  console.log('🔧 فحص آلية الإرسال في النظام...');
  
  // هنا يمكن إضافة فحص للكود المسؤول عن إرسال الرسائل
  console.log('💡 تأكد من أن الكود يستدعي Facebook API بشكل صحيح');
  console.log('💡 تأكد من أن الرسائل تُحفظ مع معرف Facebook الصحيح');
  console.log('💡 تأكد من أن هناك آلية retry في حالة فشل الإرسال');
}

debugMessageDelivery();
