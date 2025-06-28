import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGeminiMessages() {
  console.log('🔍 تشخيص مشكلة رسائل Gemini AI...');
  console.log('=' .repeat(50));
  
  try {
    // 1. البحث عن آخر المحادثات والرسائل
    console.log('📨 فحص آخر الرسائل...');
    
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(
          customer_name,
          page_id,
          company_id,
          companies(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (messagesError) {
      console.error('❌ خطأ في جلب الرسائل:', messagesError);
      return;
    }
    
    console.log(`📊 آخر ${recentMessages.length} رسائل:`);
    
    recentMessages.forEach((msg, index) => {
      const companyName = msg.conversations?.companies?.name || 'غير محدد';
      const customerName = msg.conversations?.customer_name || 'غير محدد';
      
      console.log(`\n${index + 1}. ${msg.sender_type}: ${msg.content?.substring(0, 50)}...`);
      console.log(`   العميل: ${customerName}`);
      console.log(`   الشركة: ${companyName}`);
      console.log(`   التاريخ: ${msg.created_at}`);
      console.log(`   الحالة: ${msg.status || 'غير محدد'}`);
    });
    
    // 2. فحص رسائل Gemini AI تحديداً
    console.log('\n🤖 فحص رسائل Gemini AI...');
    
    const { data: botMessages, error: botError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(
          customer_name,
          page_id,
          facebook_user_id,
          companies(name)
        )
      `)
      .eq('sender_type', 'bot')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (botError) {
      console.error('❌ خطأ في جلب رسائل البوت:', botError);
      return;
    }
    
    console.log(`📊 آخر ${botMessages.length} رسائل من البوت:`);
    
    for (const msg of botMessages) {
      const companyName = msg.conversations?.companies?.name || 'غير محدد';
      const customerName = msg.conversations?.customer_name || 'غير محدد';
      const pageId = msg.conversations?.page_id;
      const userId = msg.conversations?.facebook_user_id;
      
      console.log(`\n🤖 رسالة البوت:`);
      console.log(`   المحتوى: ${msg.content?.substring(0, 100)}...`);
      console.log(`   العميل: ${customerName} (${userId})`);
      console.log(`   الشركة: ${companyName}`);
      console.log(`   الصفحة: ${pageId}`);
      console.log(`   التاريخ: ${msg.created_at}`);
      
      // 3. اختبار إرسال الرسالة للعميل
      if (pageId && userId) {
        console.log(`   🧪 اختبار إرسال الرسالة...`);
        
        // جلب Facebook Token للصفحة
        const { data: pageSettings, error: pageError } = await supabase
          .from('facebook_settings')
          .select('access_token, page_name')
          .eq('page_id', pageId)
          .single();
        
        if (pageError || !pageSettings) {
          console.log(`   ❌ لم يتم العثور على إعدادات الصفحة`);
          continue;
        }
        
        // محاولة إرسال رسالة اختبار
        const testMessage = {
          recipient: { id: userId },
          message: { text: `اختبار إرسال - ${new Date().toLocaleTimeString('ar-EG')}` }
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
            console.log(`   📄 الصفحة: ${pageSettings.page_name}`);
            
            // تفاصيل إضافية عن الخطأ
            if (sendData.error.code === 10) {
              console.log(`   💡 السبب: المستخدم لم يرسل رسالة للصفحة مؤخراً`);
            } else if (sendData.error.code === 200) {
              console.log(`   💡 السبب: مشكلة في صلاحيات pages_messaging`);
            } else if (sendData.error.code === 190) {
              console.log(`   💡 السبب: Facebook Access Token منتهي الصلاحية`);
            }
          } else {
            console.log(`   ✅ تم الإرسال بنجاح: ${sendData.message_id}`);
          }
          
        } catch (error) {
          console.log(`   ❌ خطأ في الاتصال: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️ معلومات الإرسال غير مكتملة`);
      }
    }
    
    // 4. فحص إعدادات Facebook للشركات
    console.log('\n📄 فحص إعدادات Facebook...');
    
    const { data: facebookSettings, error: settingsError } = await supabase
      .from('facebook_settings')
      .select(`
        *,
        companies(name, email)
      `)
      .eq('is_active', true);
    
    if (settingsError) {
      console.error('❌ خطأ في جلب إعدادات Facebook:', settingsError);
      return;
    }
    
    console.log(`📊 الصفحات النشطة: ${facebookSettings.length}`);
    
    for (const setting of facebookSettings) {
      console.log(`\n📄 ${setting.page_name}:`);
      console.log(`   الشركة: ${setting.companies?.name || 'غير محدد'}`);
      console.log(`   نشط: ${setting.is_active ? 'نعم' : 'لا'}`);
      console.log(`   Webhook: ${setting.webhook_enabled ? 'مفعل' : 'معطل'}`);
      
      // اختبار Token
      try {
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${setting.access_token}`);
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          console.log(`   Token: ❌ ${tokenData.error.message}`);
        } else {
          console.log(`   Token: ✅ صحيح`);
        }
      } catch (error) {
        console.log(`   Token: ❌ خطأ في الاختبار`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ انتهى تشخيص رسائل Gemini AI');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

debugGeminiMessages();
