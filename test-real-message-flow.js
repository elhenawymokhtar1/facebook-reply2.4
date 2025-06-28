import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealMessageFlow() {
  console.log('🧪 اختبار تدفق الرسائل الحقيقي...');
  console.log('=' .repeat(60));
  
  try {
    // 1. محاكاة رسالة جديدة من العميل
    console.log('📨 محاكاة رسالة جديدة من العميل...');
    
    const testWebhookData = {
      object: 'page',
      entry: [{
        id: '351400718067673', // Simple A42 page ID
        time: Date.now(),
        messaging: [{
          sender: { id: '30517453841172195' }, // Mokhtar Elenawy
          recipient: { id: '351400718067673' },
          timestamp: Date.now(),
          message: {
            mid: `test_${Date.now()}`,
            text: 'اختبار جديد - هل يمكن للنظام الرد؟'
          }
        }]
      }]
    };
    
    console.log('📤 إرسال للـ webhook...');
    console.log('🔍 البيانات المرسلة:', JSON.stringify(testWebhookData, null, 2));
    
    // 2. إرسال للـ webhook الحقيقي
    try {
      const webhookResponse = await fetch('http://localhost:3002/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testWebhookData)
      });
      
      console.log(`📊 استجابة الـ webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);
      
      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        console.log('✅ تم إرسال الرسالة للـ webhook بنجاح');
        console.log('📝 رد الـ webhook:', responseText);
        
        // انتظار قليل لمعالجة الرسالة
        console.log('⏳ انتظار معالجة الرسالة (10 ثوان)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 3. فحص آخر رسالة من البوت
        console.log('\n🔍 فحص آخر رسالة من البوت...');
        
        const { data: latestBotMessage, error: botError } = await supabase
          .from('messages')
          .select(`
            *,
            conversations(
              customer_name,
              customer_facebook_id,
              page_id,
              companies(name)
            )
          `)
          .eq('sender_type', 'bot')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestBotMessage) {
          console.log('🤖 آخر رسالة من البوت:');
          console.log(`   المحتوى: ${latestBotMessage.content}`);
          console.log(`   العميل: ${latestBotMessage.conversations?.customer_name}`);
          console.log(`   الشركة: ${latestBotMessage.conversations?.companies?.name}`);
          console.log(`   التاريخ: ${latestBotMessage.created_at}`);
          console.log(`   معرف Facebook: ${latestBotMessage.facebook_message_id || 'غير محدد'}`);
          
          // 4. فحص إذا كانت الرسالة وصلت للعميل
          if (latestBotMessage.facebook_message_id) {
            console.log('✅ الرسالة لديها معرف Facebook - تم إرسالها بنجاح!');
          } else {
            console.log('❌ الرسالة ليس لديها معرف Facebook - لم يتم إرسالها!');
            
            // محاولة إرسال يدوي
            console.log('\n🔧 محاولة إرسال يدوي...');
            await manualSendMessage(latestBotMessage);
          }
        } else {
          console.log('⚠️ لم يتم العثور على رسالة جديدة من البوت');
          
          // فحص آخر رسائل العميل
          console.log('\n🔍 فحص آخر رسائل العميل...');
          
          const { data: customerMessages, error: custError } = await supabase
            .from('messages')
            .select('*')
            .eq('sender_type', 'customer')
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (customerMessages) {
            console.log('📨 آخر رسائل العميل:');
            customerMessages.forEach((msg, index) => {
              console.log(`  ${index + 1}. ${msg.content} - ${msg.created_at}`);
            });
          }
        }
        
      } else {
        const errorText = await webhookResponse.text();
        console.log(`❌ فشل في إرسال الرسالة للـ webhook: ${errorText}`);
      }
      
    } catch (webhookError) {
      console.error('❌ خطأ في الاتصال بالـ webhook:', webhookError.message);
      console.log('💡 تأكد من أن الخادم يعمل على localhost:3002');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ انتهى اختبار تدفق الرسائل');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

async function manualSendMessage(botMessage) {
  try {
    const conversation = botMessage.conversations;
    const pageId = conversation?.page_id;
    const userId = conversation?.customer_facebook_id;
    
    if (!pageId || !userId) {
      console.log('❌ معلومات الإرسال غير مكتملة');
      return;
    }
    
    // جلب إعدادات Facebook
    const { data: pageSettings, error: pageError } = await supabase
      .from('facebook_settings')
      .select('access_token, page_name')
      .eq('page_id', pageId)
      .single();
    
    if (pageError || !pageSettings) {
      console.log('❌ لم يتم العثور على إعدادات الصفحة');
      return;
    }
    
    console.log(`📄 إعدادات الصفحة: ${pageSettings.page_name}`);
    
    // إرسال الرسالة
    const messageToSend = {
      recipient: { id: userId },
      message: { text: botMessage.content }
    };
    
    const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageSettings.access_token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageToSend)
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.error) {
      console.log(`❌ فشل الإرسال اليدوي: ${sendData.error.message}`);
    } else {
      console.log(`✅ تم الإرسال اليدوي بنجاح: ${sendData.message_id}`);
      
      // تحديث الرسالة في قاعدة البيانات
      await supabase
        .from('messages')
        .update({ facebook_message_id: sendData.message_id })
        .eq('id', botMessage.id);
      
      console.log('📝 تم تحديث معرف Facebook في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الإرسال اليدوي:', error.message);
  }
}

testRealMessageFlow();
