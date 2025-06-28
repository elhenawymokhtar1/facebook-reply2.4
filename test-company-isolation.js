// اختبار عزل الشركات في Gemini AI
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ddwszecfsfkjnahesymm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCompanyIsolation() {
  console.log('🧪 اختبار عزل الشركات في Gemini AI...\n');

  try {
    // 1. جلب الشركات والمنتجات
    console.log('1️⃣ جلب الشركات والمنتجات...');
    
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    console.log('🏢 الشركات:', companies?.map(c => `${c.name} (${c.id})`));

    // 2. اختبار جلب المنتجات بدون عزل
    console.log('\n2️⃣ جلب المنتجات بدون عزل...');
    
    const { data: allProducts } = await supabase
      .from('ecommerce_products')
      .select('id, name, store_id')
      .eq('status', 'active')
      .limit(10);

    console.log('📦 جميع المنتجات:', allProducts?.length || 0);

    // 3. اختبار جلب المنتجات مع عزل الشركات
    console.log('\n3️⃣ جلب المنتجات مع عزل الشركات...');
    
    for (const company of companies || []) {
      console.log(`\n🏢 اختبار الشركة: ${company.name}`);
      
      const { data: companyProducts } = await supabase
        .from('ecommerce_products')
        .select(`
          id, name, store_id,
          stores!inner(
            id,
            company_id,
            name
          )
        `)
        .eq('status', 'active')
        .eq('stores.company_id', company.id);

      console.log(`   📦 منتجات الشركة: ${companyProducts?.length || 0}`);
      
      if (companyProducts && companyProducts.length > 0) {
        companyProducts.forEach(product => {
          console.log(`      - ${product.name} (متجر: ${product.stores.name})`);
        });
      } else {
        console.log('      ⚠️ لا توجد منتجات لهذه الشركة');
      }
    }

    // 4. اختبار إعدادات Gemini
    console.log('\n4️⃣ اختبار إعدادات Gemini...');
    
    for (const company of companies?.slice(0, 3) || []) {
      const { data: geminiSettings } = await supabase
        .from('gemini_settings')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_enabled', true)
        .single();

      console.log(`🤖 ${company.name}: ${geminiSettings ? '✅ لديه إعدادات' : '❌ لا توجد إعدادات'}`);
    }

    console.log('\n✅ انتهى الاختبار!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testCompanyIsolation();
