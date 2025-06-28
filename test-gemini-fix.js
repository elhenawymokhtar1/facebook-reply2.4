import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGeminiFix() {
  console.log('🧪 اختبار إصلاح Gemini AI...');
  console.log('=' .repeat(50));
  
  try {
    // 1. محاكاة رسالة جديدة من العميل
    console.log('📨 محاكاة رسالة جديدة من العميل...');
    
    const testMessage = {
      object: 'page',
      entry: [{
        id: '351400718067673',
        time: Date.now(),
        messaging: [{
          sender: { id: '30517453841172195' },
          recipient: { id: '351400718067673' },
          timestamp: Date.now(),
          message: {
            mid: `test_${Date.now()}`,
            text: 'مرحبا، عايز اشوف المنتجات المتاحة'
          }
        }]
      }]
    };
    
    // 2. إرسال الرسالة للـ webhook
    console.log('🔗 إرسال للـ webhook...');
    
    const webhookResponse = await fetch('http://localhost:3002/api/facebook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    if (webhookResponse.ok) {
      console.log('✅ تم إرسال الرسالة للـ webhook بنجاح');
      
      // انتظار قليل لمعالجة الرسالة
      console.log('⏳ انتظار معالجة الرسالة...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 3. فحص آخر رسالة من البوت
      console.log('🔍 فحص آخر رسالة من البوت...');
      
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
        
        // 4. التحقق من إرسال الرسالة عبر Facebook
        console.log('🧪 اختبار إرسال الرسالة عبر Facebook...');
        
        const conversation = latestBotMessage.conversations;
        const pageId = conversation?.page_id;
        const userId = conversation?.customer_facebook_id;
        
        if (pageId && userId) {
          // جلب إعدادات Facebook
          const { data: pageSettings, error: pageError } = await supabase
            .from('facebook_settings')
            .select('access_token, page_name')
            .eq('page_id', pageId)
            .single();
          
          if (pageSettings) {
            console.log(`📄 إعدادات الصفحة: ${pageSettings.page_name}`);
            
            // إرسال رسالة اختبار
            const testSendMessage = {
              recipient: { id: userId },
              message: { 
                text: `🎉 تم إصلاح نظام Gemini AI!\n\nالآن يمكن للذكاء الاصطناعي إرسال الرسائل بشكل طبيعي.\n\nاختبار: ${new Date().toLocaleTimeString('ar-EG')}` 
              }
            };
            
            const sendResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageSettings.access_token}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(testSendMessage)
            });
            
            const sendData = await sendResponse.json();
            
            if (sendData.error) {
              console.log(`❌ فشل الإرسال: ${sendData.error.message}`);
            } else {
              console.log(`✅ تم إرسال رسالة الاختبار بنجاح!`);
              console.log(`📨 معرف الرسالة: ${sendData.message_id}`);
            }
          } else {
            console.log('❌ لم يتم العثور على إعدادات الصفحة');
          }
        } else {
          console.log('❌ معلومات الإرسال غير مكتملة');
        }
      } else {
        console.log('⚠️ لم يتم العثور على رسالة جديدة من البوت');
      }
      
    } else {
      console.log(`❌ فشل في إرسال الرسالة للـ webhook: ${webhookResponse.status}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ انتهى اختبار إصلاح Gemini AI');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testGeminiFix();
