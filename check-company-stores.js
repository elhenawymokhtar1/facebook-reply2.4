// فحص العلاقة بين الشركات والمتاجر والمنتجات
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2ZramFoZXN5bW0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNjc2NzQ2NywiZXhwIjoyMDMyMzQzNDY3fQ.Nt2dQpivpUBjKseaGjjfHvn5WoFJkpOFPdYBWkNOBgE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanyStoresProducts() {
  console.log('🔍 فحص العلاقة بين الشركات والمتاجر والمنتجات...\n');

  try {
    // 1. جلب جميع الشركات
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email')
      .order('name');

    if (companiesError) {
      console.error('❌ خطأ في جلب الشركات:', companiesError);
      return;
    }

    console.log(`📊 إجمالي الشركات: ${companies.length}\n`);

    // 2. فحص كل شركة
    for (const company of companies) {
      console.log(`🏢 الشركة: ${company.name} (${company.id})`);

      // جلب متاجر الشركة
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, is_active')
        .eq('company_id', company.id);

      if (storesError) {
        console.error(`   ❌ خطأ في جلب متاجر الشركة: ${storesError.message}`);
        continue;
      }

      console.log(`   📦 المتاجر: ${stores.length}`);

      if (stores.length === 0) {
        console.log('   ⚠️ لا توجد متاجر لهذه الشركة\n');
        continue;
      }

      // فحص كل متجر
      for (const store of stores) {
        console.log(`     🏪 المتجر: ${store.name} (${store.is_active ? 'نشط' : 'غير نشط'})`);

        // جلب منتجات المتجر
        const { data: products, error: productsError } = await supabase
          .from('ecommerce_products')
          .select('id, name, price, status')
          .eq('store_id', store.id);

        if (productsError) {
          console.error(`       ❌ خطأ في جلب منتجات المتجر: ${productsError.message}`);
          continue;
        }

        console.log(`       📦 المنتجات: ${products.length}`);

        if (products.length > 0) {
          products.forEach((product, index) => {
            console.log(`         ${index + 1}. ${product.name} - ${product.price} ج.م (${product.status})`);
          });
        }
      }

      console.log(''); // سطر فارغ بين الشركات
    }

    // 3. إحصائيات عامة
    console.log('\n📊 إحصائيات عامة:');
    
    const { data: allStores } = await supabase
      .from('stores')
      .select('id');
    
    const { data: allProducts } = await supabase
      .from('ecommerce_products')
      .select('id');

    console.log(`   🏪 إجمالي المتاجر: ${allStores?.length || 0}`);
    console.log(`   📦 إجمالي المنتجات: ${allProducts?.length || 0}`);

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل الفحص
checkCompanyStoresProducts().then(() => {
  console.log('\n✅ انتهى الفحص');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل الفحص:', error);
  process.exit(1);
});
