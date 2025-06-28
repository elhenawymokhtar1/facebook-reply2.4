import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

class SmartMonitoringSystem {
  constructor() {
    this.lastCheckedTime = new Date().toISOString();
    this.alertsSent = new Set(); // لتجنب إرسال تنبيهات مكررة
    this.healthStatus = {
      geminiSettings: true,
      facebookTokens: true,
      messageDelivery: true,
      lastCheck: new Date().toISOString()
    };
  }

  async start() {
    console.log('🛡️ نظام المراقبة الذكي لـ Gemini AI...');
    console.log('=' .repeat(60));
    console.log('✅ يراقب جميع الشركات والصفحات');
    console.log('✅ يكتشف المشاكل تلقائياً');
    console.log('✅ يصلح الرسائل غير المرسلة');
    console.log('✅ ينبه عند انتهاء صلاحية Tokens');
    console.log('=' .repeat(60));

    // فحص شامل أولي
    await this.comprehensiveHealthCheck();

    // بدء المراقبة المستمرة
    setInterval(() => this.monitorAndFix(), 5000); // كل 5 ثوان
    setInterval(() => this.comprehensiveHealthCheck(), 300000); // كل 5 دقائق
    setInterval(() => this.generateHealthReport(), 1800000); // كل 30 دقيقة

    console.log('\n🚀 نظام المراقبة الذكي نشط الآن!');
  }

  async monitorAndFix() {
    try {
      // 1. مراقبة الرسائل غير المرسلة
      await this.monitorUnsentMessages();
      
      // 2. مراقبة إعدادات Gemini
      await this.monitorGeminiSettings();
      
      // 3. مراقبة Facebook Tokens
      await this.monitorFacebookTokens();

    } catch (error) {
      console.error('❌ خطأ في المراقبة:', error.message);
    }
  }

  async monitorUnsentMessages() {
    const { data: unsentMessages, error } = await supabase
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
      .is('facebook_message_id', null)
      .gte('created_at', this.lastCheckedTime)
      .order('created_at', { ascending: true });

    if (error) return;

    if (unsentMessages && unsentMessages.length > 0) {
      console.log(`\n⚠️ تم اكتشاف ${unsentMessages.length} رسالة غير مرسلة`);
      
      for (const message of unsentMessages) {
        await this.fixUnsentMessage(message);
      }
    }

    this.lastCheckedTime = new Date().toISOString();
  }

  async fixUnsentMessage(message) {
    const conversation = message.conversations;
    const company = conversation?.companies;
    
    console.log(`🔧 إصلاح رسالة: ${company?.name || 'شركة غير محددة'} - ${conversation?.customer_name}`);
    
    const pageId = conversation?.page_id || conversation?.facebook_page_id;
    const userId = conversation?.customer_facebook_id;

    if (!pageId || !userId) {
      console.log('   ❌ معلومات الإرسال غير مكتملة');
      return;
    }

    // جلب إعدادات Facebook
    const { data: pageSettings, error: pageError } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('page_id', pageId)
      .single();

    if (pageError || !pageSettings) {
      console.log('   ❌ إعدادات Facebook غير متاحة');
      await this.alertMissingFacebookSettings(pageId, company?.name);
      return;
    }

    if (!pageSettings.is_active) {
      console.log('   ⚠️ الصفحة غير نشطة');
      return;
    }

    // محاولة الإرسال
    try {
      const messageToSend = {
        recipient: { id: userId },
        message: { text: message.content }
      };

      const response = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageSettings.access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageToSend)
      });

      const result = await response.json();

      if (result.error) {
        console.log(`   ❌ فشل الإرسال: ${result.error.message} (كود: ${result.error.code})`);
        
        if (result.error.code === 190) {
          await this.alertExpiredToken(pageSettings, company?.name);
        }
      } else {
        console.log(`   ✅ تم الإرسال بنجاح: ${result.message_id}`);
        
        // تحديث الرسالة
        await supabase
          .from('messages')
          .update({ facebook_message_id: result.message_id })
          .eq('id', message.id);
      }

    } catch (error) {
      console.log(`   ❌ خطأ في الإرسال: ${error.message}`);
    }
  }

  async monitorGeminiSettings() {
    // فحص إعدادات Gemini لجميع الشركات
    const { data: companies, error: compError } = await supabase
      .from('companies')
      .select('id, name');

    if (compError || !companies) return;

    for (const company of companies) {
      const { data: geminiSettings, error: geminiError } = await supabase
        .from('gemini_settings')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_enabled', true);

      if (geminiError || !geminiSettings || geminiSettings.length === 0) {
        await this.alertMissingGeminiSettings(company);
      }
    }
  }

  async monitorFacebookTokens() {
    const { data: facebookSettings, error } = await supabase
      .from('facebook_settings')
      .select('*')
      .eq('is_active', true);

    if (error || !facebookSettings) return;

    for (const setting of facebookSettings) {
      try {
        const tokenResponse = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${setting.access_token}`);
        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          await this.alertExpiredToken(setting);
        }
      } catch (error) {
        console.log(`⚠️ خطأ في فحص token للصفحة: ${setting.page_name}`);
      }
    }
  }

  async alertMissingFacebookSettings(pageId, companyName) {
    const alertKey = `fb_settings_${pageId}`;
    if (this.alertsSent.has(alertKey)) return;

    console.log(`🚨 تنبيه: إعدادات Facebook مفقودة للصفحة ${pageId} - الشركة: ${companyName}`);
    this.alertsSent.add(alertKey);
    
    // يمكن إضافة إرسال إيميل أو إشعار هنا
  }

  async alertExpiredToken(setting, companyName) {
    const alertKey = `expired_token_${setting.page_id}`;
    if (this.alertsSent.has(alertKey)) return;

    console.log(`🚨 تنبيه: Facebook Token منتهي الصلاحية للصفحة: ${setting.page_name} - الشركة: ${companyName}`);
    this.alertsSent.add(alertKey);
    
    // تعطيل الصفحة مؤقتاً
    await supabase
      .from('facebook_settings')
      .update({ is_active: false })
      .eq('id', setting.id);
  }

  async alertMissingGeminiSettings(company) {
    const alertKey = `gemini_settings_${company.id}`;
    if (this.alertsSent.has(alertKey)) return;

    console.log(`🚨 تنبيه: إعدادات Gemini مفقودة للشركة: ${company.name}`);
    this.alertsSent.add(alertKey);
  }

  async comprehensiveHealthCheck() {
    console.log('\n🏥 فحص صحة شامل للنظام...');
    
    // فحص إعدادات Gemini
    const { data: geminiCount } = await supabase
      .from('gemini_settings')
      .select('id', { count: 'exact' })
      .eq('is_enabled', true);

    // فحص Facebook Tokens
    const { data: fbCount } = await supabase
      .from('facebook_settings')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // فحص الرسائل غير المرسلة
    const { data: unsentCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('sender_type', 'bot')
      .is('facebook_message_id', null);

    this.healthStatus = {
      geminiSettings: (geminiCount?.length || 0) > 0,
      facebookTokens: (fbCount?.length || 0) > 0,
      unsentMessages: (unsentCount?.length || 0),
      lastCheck: new Date().toISOString()
    };

    console.log('📊 حالة النظام:');
    console.log(`   ✅ إعدادات Gemini نشطة: ${geminiCount?.length || 0}`);
    console.log(`   ✅ Facebook Tokens نشطة: ${fbCount?.length || 0}`);
    console.log(`   ⚠️ رسائل غير مرسلة: ${unsentCount?.length || 0}`);
  }

  async generateHealthReport() {
    console.log('\n📋 تقرير صحة النظام:');
    console.log('=' .repeat(40));
    console.log(`🕐 آخر فحص: ${this.healthStatus.lastCheck}`);
    console.log(`🤖 إعدادات Gemini: ${this.healthStatus.geminiSettings ? '✅ سليمة' : '❌ تحتاج مراجعة'}`);
    console.log(`📱 Facebook Tokens: ${this.healthStatus.facebookTokens ? '✅ سليمة' : '❌ تحتاج تجديد'}`);
    console.log(`📨 رسائل غير مرسلة: ${this.healthStatus.unsentMessages}`);
    console.log('=' .repeat(40));
  }
}

// بدء النظام
const monitor = new SmartMonitoringSystem();
monitor.start();
