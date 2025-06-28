import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalFix() {
  console.log('🎯 اختبار الإصلاح النهائي لرسائل Gemini AI...');
  console.log('=' .repeat(60));
  
  try {
    // 1. محاكاة رسالة جديدة من العميل
    console.log('📨 إرسال رسالة اختبار جديدة...');
    
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
            mid: `final_test_${Date.now()}`,
            text: 'اختبار نهائي - هل تم إصلاح المشكلة؟'
          }
        }]
      }]
    };
    
    console.log('📤 إرسال للـ webhook...');
    
    // 2. إرسال للـ webhook
    const webhookResponse = await fetch('http://localhost:3002/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testWebhookData)
    });
    
    console.log(`📊 استجابة الـ webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);
    
    if (webhookResponse.ok) {
      console.log('✅ تم إرسال الرسالة للـ webhook بنجاح');
      
      // انتظار معالجة الرسالة
      console.log('⏳ انتظار معالجة الرسالة (15 ثانية)...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
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
        console.log(`   الحالة: ${latestBotMessage.status || 'غير محدد'}`);
        
        // 4. تحليل النتيجة
        if (latestBotMessage.facebook_message_id) {
          console.log('\n🎉 نجح الإصلاح! الرسالة تم إرسالها تلقائياً!');
          console.log('✅ النظام يعمل بشكل مثالي الآن');
          
          // التحقق من الحالة
          if (latestBotMessage.status === 'delivered') {
            console.log('✅ حالة الرسالة: تم التوصيل');
          }
          
        } else {
          console.log('\n❌ لا يزال هناك مشكلة - الرسالة لم تحصل على معرف Facebook');
          
          // فحص إضافي للأخطاء
          console.log('\n🔍 فحص إضافي للمشكلة...');
          
          // فحص إعدادات Gemini
          const { data: geminiSettings } = await supabase
            .from('gemini_settings')
            .select('*')
            .single();
          
          if (!geminiSettings) {
            console.log('❌ مشكلة: لا توجد إعدادات Gemini');
          } else {
            console.log(`✅ إعدادات Gemini موجودة ومفعلة: ${geminiSettings.is_enabled}`);
          }
          
          // فحص إعدادات Facebook
          const { data: fbSettings } = await supabase
            .from('facebook_settings')
            .select('*')
            .eq('page_id', '351400718067673')
            .single();
          
          if (!fbSettings) {
            console.log('❌ مشكلة: لا توجد إعدادات Facebook للصفحة');
          } else {
            console.log(`✅ إعدادات Facebook موجودة ونشطة: ${fbSettings.is_active}`);
          }
        }
        
      } else {
        console.log('⚠️ لم يتم العثور على رسالة جديدة من البوت');
        console.log('💡 قد تكون المشكلة في معالجة Gemini AI نفسه');
      }
      
    } else {
      const errorText = await webhookResponse.text();
      console.log(`❌ فشل في إرسال الرسالة للـ webhook: ${errorText}`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 ملخص الاختبار النهائي:');
    
    if (latestBotMessage?.facebook_message_id) {
      console.log('🎉 النتيجة: نجح الإصلاح! النظام يعمل بشكل مثالي!');
      console.log('✅ رسائل Gemini AI تُرسل تلقائياً للعملاء');
      console.log('✅ الرسائل تُحفظ مع معرف Facebook');
      console.log('✅ النظام جاهز للاستخدام');
    } else {
      console.log('❌ النتيجة: لا تزال هناك مشكلة تحتاج حل إضافي');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testFinalFix();
