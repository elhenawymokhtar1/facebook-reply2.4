// اختبار مباشر لخدمة Gemini
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ddwszecfsfkjnahesymm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testGeminiService() {
  console.log('🧪 اختبار خدمة Gemini مباشرة...\n');

  try {
    // 1. إنشاء محادثة تجريبية
    console.log('1️⃣ إنشاء محادثة تجريبية...');
    
    const testConversation = {
      facebook_page_id: '260345600493273',
      customer_facebook_id: 'test_user_999',
      customer_name: 'عميل تجريبي',
      page_id: '260345600493273',
      company_id: 'a7854ed7-f421-485b-87b4-7829fddf82c3', // شركة 121cx
      last_message_at: new Date().toISOString(),
      is_online: true,
      unread_count: 0
    };

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(testConversation)
      .select('id')
      .single();

    if (convError) {
      console.error('❌ خطأ في إنشاء المحادثة:', convError);
      return;
    }

    console.log('✅ تم إنشاء المحادثة:', conversation.id);

    // 2. اختبار جلب إعدادات Gemini للشركة
    console.log('\n2️⃣ اختبار إعدادات Gemini...');
    
    const { data: geminiSettings } = await supabase
      .from('gemini_settings')
      .select('*')
      .eq('company_id', testConversation.company_id)
      .eq('is_enabled', true)
      .single();

    console.log('🤖 إعدادات Gemini:', {
      found: !!geminiSettings,
      enabled: geminiSettings?.is_enabled,
      hasApiKey: !!geminiSettings?.api_key,
      model: geminiSettings?.model
    });

    // 3. اختبار جلب المنتجات للشركة
    console.log('\n3️⃣ اختبار جلب المنتجات...');
    
    const { data: companyProducts } = await supabase
      .from('ecommerce_products')
      .select(`
        id, name, price,
        stores!inner(
          id,
          company_id,
          name
        )
      `)
      .eq('status', 'active')
      .eq('stores.company_id', testConversation.company_id);

    console.log('📦 منتجات الشركة:', {
      count: companyProducts?.length || 0,
      products: companyProducts?.map(p => p.name) || []
    });

    // 4. اختبار استدعاء API مباشر
    console.log('\n4️⃣ اختبار API مباشر...');
    
    const response = await fetch('http://localhost:3002/api/gemini/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderId: 'test_user_999',
        messageText: 'مرحبا، أريد أشوف المنتجات',
        pageId: '260345600493273',
        conversationId: conversation.id
      })
    });

    const result = await response.json();
    console.log('🔗 نتيجة API:', result);

    // 5. تنظيف - حذف المحادثة التجريبية
    console.log('\n5️⃣ تنظيف البيانات...');
    
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation.id);

    console.log('✅ تم حذف المحادثة التجريبية');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testGeminiService();
