// 🔍 فحص معلومات الصفحة من Facebook API
import fetch from 'node-fetch';

async function checkFacebookPage(accessToken) {
  console.log('🔍 فحص معلومات الصفحة من Facebook API...\n');
  
  try {
    // 1. فحص نوع الـ Token
    console.log('1️⃣ فحص نوع الـ Access Token...');
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    
    if (!tokenResponse.ok) {
      throw new Error(`Facebook API Error: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('❌ خطأ في الـ Token:', tokenData.error.message);
      return false;
    }
    
    console.log('✅ معلومات الـ Token:');
    console.log(`   📄 ID: ${tokenData.id}`);
    console.log(`   📝 Name: ${tokenData.name}`);
    console.log(`   🏷️ Category: ${tokenData.category || 'غير محدد'}`);
    
    // 2. فحص صلاحيات الـ Token
    console.log('\n2️⃣ فحص صلاحيات الـ Token...');
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`
    );
    
    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('✅ الصلاحيات المتاحة:');
      
      if (permissionsData.data) {
        permissionsData.data.forEach(permission => {
          const status = permission.status === 'granted' ? '✅' : '❌';
          console.log(`   ${status} ${permission.permission}`);
        });
      }
    }
    
    // 3. فحص معلومات الصفحة التفصيلية
    console.log('\n3️⃣ فحص معلومات الصفحة التفصيلية...');
    const detailsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${tokenData.id}?fields=id,name,category,about,description,website,phone,emails,location&access_token=${accessToken}`
    );
    
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      console.log('📋 تفاصيل الصفحة:');
      console.log(`   🆔 ID: ${detailsData.id}`);
      console.log(`   📝 الاسم: ${detailsData.name}`);
      console.log(`   🏷️ الفئة: ${detailsData.category || 'غير محدد'}`);
      console.log(`   📖 الوصف: ${detailsData.about || 'غير محدد'}`);
      console.log(`   🌐 الموقع: ${detailsData.website || 'غير محدد'}`);
      console.log(`   📞 الهاتف: ${detailsData.phone || 'غير محدد'}`);
      
      if (detailsData.location) {
        console.log(`   📍 الموقع: ${detailsData.location.city || ''} ${detailsData.location.country || ''}`);
      }
    }
    
    // 4. فحص إذا كان User Token أم Page Token
    console.log('\n4️⃣ تحديد نوع الـ Token...');
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      if (debugData.data) {
        console.log('🔍 معلومات الـ Token:');
        console.log(`   📱 التطبيق: ${debugData.data.app_id}`);
        console.log(`   👤 النوع: ${debugData.data.type}`);
        console.log(`   ⏰ انتهاء الصلاحية: ${debugData.data.expires_at ? new Date(debugData.data.expires_at * 1000).toLocaleString('ar-EG') : 'لا ينتهي'}`);
        console.log(`   ✅ صالح: ${debugData.data.is_valid ? 'نعم' : 'لا'}`);
      }
    }
    
    // 5. محاولة جلب الصفحات إذا كان User Token
    console.log('\n5️⃣ محاولة جلب الصفحات المتاحة...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      if (pagesData.data && pagesData.data.length > 0) {
        console.log('📄 الصفحات المتاحة:');
        pagesData.data.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.name} (${page.id})`);
          console.log(`      🏷️ الفئة: ${page.category}`);
          console.log(`      🔑 لديه Access Token: ${page.access_token ? 'نعم' : 'لا'}`);
        });
      } else {
        console.log('📭 لا توجد صفحات متاحة (هذا Page Token مباشر)');
      }
    }
    
    console.log('\n🎯 الخلاصة:');
    console.log(`📝 اسم الصفحة الحقيقي: ${tokenData.name}`);
    console.log(`🆔 معرف الصفحة: ${tokenData.id}`);
    
    return {
      id: tokenData.id,
      name: tokenData.name,
      category: tokenData.category
    };
    
  } catch (error) {
    console.error('💥 خطأ في فحص الصفحة:', error.message);
    return false;
  }
}

// الـ Access Token المرسل
const accessToken = 'EAAUpPO0SIEABOzaB4cVxhUXfSjhFJQKBul6MdprYhGM8XGBzHHWUrQS0pJCi0ZBhu4vUmOE53DijqKRpKLJDQjNiegccwkw47woCkUh7AUemuYG3u4cZBd7ZB6CsKCFOqSPqpjEHeaDzIoMbl7sL01IAWZCxZBzYvQ0HXGgjCEYSKGFfQOBG2CirnhcnfzphUrvCP978GsDZBOEaR2sDypzhVUcQZDZD';

checkFacebookPage(accessToken)
  .then(result => {
    if (result) {
      console.log('\n✅ تم فحص الصفحة بنجاح!');
      console.log('💡 إذا كان الاسم مختلف عن المتوقع، فهذا هو الاسم الصحيح للصفحة على Facebook');
    } else {
      console.log('\n❌ فشل في فحص الصفحة');
    }
  })
  .catch(error => {
    console.error('💥 خطأ عام:', error);
  });
