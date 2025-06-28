import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRealGeminiIssue() {
  console.log('🔍 تشخيص شامل لمشكلة رسائل Gemini AI...');
  console.log('=' .repeat(60));
  
  try {
    // 1. فحص آخر 5 رسائل من البوت
    console.log('🤖 فحص آخر رسائل Gemini AI...');
    
    const { data: botMessages, error: botError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(
          customer_name,
          customer_facebook_id,
          page_id,
          facebook_page_id,
          company_id,
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
    
    console.log(`📊 عدد رسائل البوت الأخيرة: ${botMessages?.length || 0}`);
    
    if (!botMessages || botMessages.length === 0) {
      console.log('⚠️ لا توجد رسائل من البوت');
      return;
    }
    
    // 2. تحليل كل رسالة
    for (let i = 0; i < botMessages.length; i++) {
      const msg = botMessages[i];
      const conversation = msg.conversations;
      
      console.log(`\n📨 رسالة ${i + 1}:`);
      console.log(`   المحتوى: ${msg.content?.substring(0, 80)}...`);
      console.log(`   العميل: ${conversation?.customer_name || 'غير محدد'}`);
      console.log(`   الشركة: ${conversation?.companies?.name || 'غير محدد'}`);
      console.log(`   التاريخ: ${msg.created_at}`);
      console.log(`   معرف المحادثة: ${msg.conversation_id}`);
      console.log(`   معرف Facebook: ${conversation?.customer_facebook_id || 'غير محدد'}`);
      console.log(`   معرف الصفحة: ${conversation?.page_id || conversation?.facebook_page_id || 'غير محدد'}`);
      console.log(`   حالة الرسالة: ${msg.status || 'غير محدد'}`);
      console.log(`   معرف Facebook للرسالة: ${msg.facebook_message_id || 'غير محدد'}`);
      
      // 3. اختبار إرسال لكل رسالة
      const pageId = conversation?.page_id || conversation?.facebook_page_id;
      const userId = conversation?.customer_facebook_id;
      
      if (pageId && userId) {
        console.log(`   🧪 اختبار الإرسال...`);
        
        // جلب إعدادات Facebook
        const { data: pageSettings, error: pageError } = await supabase
          .from('facebook_settings')
          .select('access_token, page_name, is_active')
          .eq('page_id', pageId)
          .single();
        
        if (pageError || !pageSettings) {
          console.log(`   ❌ لم يتم العثور على إعدادات الصفحة: ${pageError?.message}`);
          continue;
        }
        
        console.log(`   📄 الصفحة: ${pageSettings.page_name} (نشط: ${pageSettings.is_active})`);
        
        // اختبار Token
        try {
          const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${pageSettings.access_token}`);
          const tokenData = await tokenResponse.json();
          
          if (tokenData.error) {
            console.log(`   ❌ Token غير صحيح: ${tokenData.error.message}`);
            continue;
          } else {
            console.log(`   ✅ Token صحيح`);
          }
        } catch (error) {
          console.log(`   ❌ خطأ في اختبار Token: ${error.message}`);
          continue;
        }
        
        // محاولة إعادة إرسال الرسالة الأصلية
        const testMessage = {
          recipient: { id: userId },
          message: { text: msg.content }
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
            console.log(`   ❌ فشل الإرسال: ${sendData.error.message} (كود: ${sendData.error.code})`);
            
            // تحليل أسباب الفشل
            if (sendData.error.code === 10) {
              console.log(`   💡 السبب: المستخدم لم يرسل رسالة خلال آخر 24 ساعة`);
            } else if (sendData.error.code === 190) {
              console.log(`   💡 السبب: Token منتهي الصلاحية`);
            } else if (sendData.error.code === 200) {
              console.log(`   💡 السبب: مشكلة في الصلاحيات`);
            }
          } else {
            console.log(`   ✅ تم إعادة الإرسال بنجاح: ${sendData.message_id}`);
            
            // تحديث الرسالة الأصلية بمعرف Facebook
            if (!msg.facebook_message_id) {
              await supabase
                .from('messages')
                .update({ 
                  facebook_message_id: sendData.message_id,
                  status: 'delivered'
                })
                .eq('id', msg.id);
              
              console.log(`   📝 تم تحديث معرف Facebook للرسالة`);
            }
          }
          
        } catch (error) {
          console.log(`   ❌ خطأ في الإرسال: ${error.message}`);
        }
        
      } else {
        console.log(`   ⚠️ معلومات الإرسال غير مكتملة`);
        console.log(`     معرف الصفحة: ${pageId || 'مفقود'}`);
        console.log(`     معرف المستخدم: ${userId || 'مفقود'}`);
      }
    }
    
    // 4. فحص إعدادات Gemini
    console.log('\n🤖 فحص إعدادات Gemini AI...');
    
    const { data: geminiSettings, error: geminiError } = await supabase
      .from('gemini_settings')
      .select('*')
      .single();
    
    if (geminiSettings) {
      console.log('✅ إعدادات Gemini موجودة:');
      console.log(`   مفعل: ${geminiSettings.is_enabled}`);
      console.log(`   النموذج: ${geminiSettings.model}`);
      console.log(`   لديه API Key: ${!!geminiSettings.api_key}`);
    } else {
      console.log('❌ لا توجد إعدادات Gemini');
    }
    
    // 5. فحص آخر رسائل العملاء
    console.log('\n👤 فحص آخر رسائل العملاء...');
    
    const { data: customerMessages, error: custError } = await supabase
      .from('messages')
      .select(`
        *,
        conversations(customer_name, page_id)
      `)
      .eq('sender_type', 'customer')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (customerMessages) {
      customerMessages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.conversations?.customer_name}: ${msg.content?.substring(0, 50)}...`);
        console.log(`   التاريخ: ${msg.created_at}`);
      });
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 ملخص التشخيص:');
    console.log(`📨 رسائل البوت الأخيرة: ${botMessages.length}`);
    console.log(`🤖 إعدادات Gemini: ${geminiSettings ? 'موجودة' : 'مفقودة'}`);
    console.log(`👤 رسائل العملاء الأخيرة: ${customerMessages?.length || 0}`);
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

debugRealGeminiIssue();
