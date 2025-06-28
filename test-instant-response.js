import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInstantResponse() {
  console.log('⚡ اختبار الرد الفوري من Gemini AI...');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // 1. محاكاة رسالة جديدة من العميل
    console.log('📨 إرسال رسالة اختبار...');
    
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
            mid: `instant_test_${Date.now()}`,
            text: 'اختبار الرد الفوري - هل النظام يعمل بسرعة؟'
          }
        }]
      }]
    };
    
    console.log(`⏰ وقت الإرسال: ${new Date().toLocaleTimeString('ar-EG')}`);
    
    // 2. إرسال للـ webhook
    const webhookResponse = await fetch('http://localhost:3002/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testWebhookData)
    });
    
    const webhookTime = Date.now() - startTime;
    console.log(`📊 وقت استجابة الـ webhook: ${webhookTime}ms`);
    
    if (webhookResponse.ok) {
      console.log('✅ تم إرسال الرسالة للـ webhook بنجاح');
      
      // 3. مراقبة الرد الفوري
      console.log('\n⏳ مراقبة الرد الفوري...');
      
      let attempts = 0;
      const maxAttempts = 20; // 20 ثانية
      let botMessage = null;
      
      while (attempts < maxAttempts && !botMessage) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية
        attempts++;
        
        // البحث عن رد البوت
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
          .gte('created_at', new Date(startTime).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestBotMessage) {
          botMessage = latestBotMessage;
          break;
        }
        
        console.log(`⏳ محاولة ${attempts}/${maxAttempts}...`);
      }
      
      if (botMessage) {
        const responseTime = Date.now() - startTime;
        console.log('\n🎉 تم العثور على رد البوت!');
        console.log(`⚡ إجمالي وقت الاستجابة: ${responseTime}ms (${(responseTime/1000).toFixed(1)} ثانية)`);
        console.log(`📝 محتوى الرد: ${botMessage.content}`);
        console.log(`👤 العميل: ${botMessage.conversations?.customer_name}`);
        console.log(`🏢 الشركة: ${botMessage.conversations?.companies?.name}`);
        console.log(`📨 معرف Facebook: ${botMessage.facebook_message_id || 'غير محدد'}`);
        
        // 4. تحليل الأداء
        console.log('\n📊 تحليل الأداء:');
        
        if (responseTime < 5000) {
          console.log('🚀 ممتاز! رد سريع جداً (أقل من 5 ثوان)');
        } else if (responseTime < 10000) {
          console.log('✅ جيد! رد سريع (أقل من 10 ثوان)');
        } else if (responseTime < 20000) {
          console.log('⚠️ مقبول (أقل من 20 ثانية)');
        } else {
          console.log('❌ بطيء (أكثر من 20 ثانية)');
        }
        
        if (botMessage.facebook_message_id) {
          console.log('✅ الرد تم إرساله للعميل بنجاح');
          console.log('🎯 النظام يعمل بشكل فوري ومثالي!');
        } else {
          console.log('⚠️ الرد لم يُرسل للعميل - يحتاج النظام المساعد');
        }
        
      } else {
        console.log('\n❌ لم يتم العثور على رد من البوت خلال 20 ثانية');
        console.log('💡 قد تكون هناك مشكلة في Gemini AI أو الخادم');
      }
      
    } else {
      const errorText = await webhookResponse.text();
      console.log(`❌ فشل في إرسال الرسالة للـ webhook: ${errorText}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 ملخص اختبار الرد الفوري:');
    
    if (botMessage) {
      const responseTime = Date.now() - startTime;
      console.log(`⚡ وقت الاستجابة: ${(responseTime/1000).toFixed(1)} ثانية`);
      console.log(`📨 الرد: ${botMessage.facebook_message_id ? 'تم الإرسال' : 'لم يُرسل'}`);
      console.log(`🎯 النتيجة: ${botMessage.facebook_message_id ? 'نجح الاختبار!' : 'يحتاج تحسين'}`);
    } else {
      console.log('❌ النتيجة: فشل الاختبار');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الرد الفوري:', error.message);
  }
}

testInstantResponse();
