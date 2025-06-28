import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversations() {
  try {
    console.log('🔍 فحص المحادثات في قاعدة البيانات...');
    
    // البحث عن شركة 121cx
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', '121@sdfds.com')
      .single();
    
    if (companyError || !company) {
      console.log('❌ لم يتم العثور على شركة 121cx');
      return;
    }
    
    console.log('✅ الشركة:', {
      id: company.id,
      name: company.name,
      email: company.email
    });
    
    // البحث عن صفحات الشركة
    const { data: pages, error: pagesError } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('company_id', company.id);
    
    if (pagesError) {
      console.error('❌ خطأ في البحث عن الصفحات:', pagesError);
      return;
    }
    
    console.log('📄 صفحات الشركة:');
    pages.forEach(page => {
      console.log(`  - ${page.page_name} (${page.page_id})`);
    });
    
    // البحث عن جميع المحادثات
    console.log('\n🔍 البحث عن جميع المحادثات...');
    const { data: allConversations, error: allConvError } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (allConvError) {
      console.error('❌ خطأ في البحث عن المحادثات:', allConvError);
      return;
    }
    
    console.log(`📊 إجمالي المحادثات: ${allConversations.length}`);
    
    if (allConversations.length > 0) {
      console.log('📋 آخر المحادثات:');
      allConversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.customer_name || 'غير محدد'} - ${conv.page_id} - Company: ${conv.company_id || 'غير محدد'}`);
        console.log(`     آخر تحديث: ${conv.updated_at}`);
      });
    }
    
    // البحث عن المحادثات المرتبطة بالشركة
    console.log('\n🔍 البحث عن محادثات الشركة 121cx...');
    const { data: companyConversations, error: companyConvError } = await supabase
      .from('conversations')
      .select('*')
      .eq('company_id', company.id)
      .order('updated_at', { ascending: false });
    
    if (companyConvError) {
      console.error('❌ خطأ في البحث عن محادثات الشركة:', companyConvError);
      return;
    }
    
    console.log(`📊 محادثات الشركة 121cx: ${companyConversations.length}`);
    
    if (companyConversations.length > 0) {
      console.log('📋 محادثات الشركة:');
      companyConversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.customer_name || 'غير محدد'} - ${conv.page_id}`);
        console.log(`     آخر رسالة: ${conv.last_message || 'غير محدد'}`);
        console.log(`     آخر تحديث: ${conv.updated_at}`);
      });
    } else {
      console.log('⚠️ لا توجد محادثات مرتبطة بالشركة 121cx');
      
      // البحث عن محادثات بدون company_id
      console.log('\n🔍 البحث عن محادثات بدون company_id...');
      const { data: orphanConversations, error: orphanError } = await supabase
        .from('conversations')
        .select('*')
        .is('company_id', null)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (orphanConversations && orphanConversations.length > 0) {
        console.log(`📊 محادثات بدون company_id: ${orphanConversations.length}`);
        console.log('📋 أمثلة:');
        orphanConversations.forEach((conv, index) => {
          console.log(`  ${index + 1}. ${conv.customer_name || 'غير محدد'} - ${conv.page_id}`);
          console.log(`     آخر رسالة: ${conv.last_message || 'غير محدد'}`);
        });
        
        // ربط المحادثات بالشركة إذا كانت من صفحاتها
        console.log('\n🔧 ربط المحادثات بالشركة...');
        const pageIds = pages.map(p => p.page_id);
        
        for (const conv of orphanConversations) {
          if (pageIds.includes(conv.page_id)) {
            console.log(`🔗 ربط المحادثة ${conv.id} بالشركة...`);
            
            const { error: updateError } = await supabase
              .from('conversations')
              .update({ company_id: company.id })
              .eq('id', conv.id);
            
            if (updateError) {
              console.error(`❌ خطأ في ربط المحادثة ${conv.id}:`, updateError);
            } else {
              console.log(`✅ تم ربط المحادثة ${conv.id} بالشركة`);
            }
          }
        }
      }
    }
    
    // البحث عن الرسائل الحديثة
    console.log('\n🔍 البحث عن الرسائل الحديثة...');
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentMessages && recentMessages.length > 0) {
      console.log('📨 آخر الرسائل:');
      recentMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.sender_type}: ${msg.content}`);
        console.log(`     المحادثة: ${msg.conversation_id}`);
        console.log(`     التاريخ: ${msg.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

checkConversations();
