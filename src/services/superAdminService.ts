/**
 * 👑 خدمة إدارة المستخدم الأساسي (Super Admin)
 * تاريخ الإنشاء: 22 يونيو 2025
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// إعداد Supabase
const supabaseUrl = 'https://ddwszecfsfkjnahesymm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3N6ZWNmc2Zram5haGVzeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDc2MDYsImV4cCI6MjA2Mzg4MzYwNn0.5jo4tgLAMqwVnYkhUYBa3WrNxann8xBqkNzba8DaCMg';
const supabase = createClient(supabaseUrl, supabaseKey);

// بيانات المستخدم الأساسي الافتراضية
export const DEFAULT_SUPER_ADMIN = {
  email: 'admin@system.com',
  password: 'Admin123456!',
  name: 'مدير النظام الأساسي',
  role: 'owner' as const
};

export interface SuperAdminCredentials {
  email: string;
  password: string;
  name: string;
  companyId?: string;
}

export class SuperAdminService {
  /**
   * 👑 إنشاء مستخدم أساسي للنظام
   */
  static async createSystemSuperAdmin(): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log('👑 [SUPER_ADMIN] بدء إنشاء المستخدم الأساسي للنظام...');

      // التحقق من وجود المستخدم الأساسي
      const { data: existingAdmin, error: checkError } = await supabase
        .from('system_admins')
        .select('id, email')
        .eq('email', DEFAULT_SUPER_ADMIN.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAdmin) {
        console.log('👑 [SUPER_ADMIN] المستخدم الأساسي موجود بالفعل');
        return {
          success: true,
          data: existingAdmin,
          message: 'المستخدم الأساسي موجود بالفعل'
        };
      }

      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN.password, 12);

      // إنشاء المستخدم الأساسي
      const { data: newAdmin, error: insertError } = await supabase
        .from('system_admins')
        .insert({
          email: DEFAULT_SUPER_ADMIN.email,
          name: DEFAULT_SUPER_ADMIN.name,
          password_hash: passwordHash,
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ [SUPER_ADMIN] تم إنشاء المستخدم الأساسي بنجاح');
      
      return {
        success: true,
        data: newAdmin,
        message: 'تم إنشاء المستخدم الأساسي بنجاح'
      };
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في إنشاء المستخدم الأساسي:', error);
      return {
        success: false,
        message: 'فشل في إنشاء المستخدم الأساسي'
      };
    }
  }

  /**
   * 👑 إنشاء مستخدم أساسي للشركة عند التسجيل
   */
  static async createCompanySuperAdmin(
    companyId: string,
    adminData: SuperAdminCredentials
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log(`👑 [SUPER_ADMIN] إنشاء مستخدم أساسي للشركة ${companyId}`);

      // التحقق من وجود مستخدم أساسي للشركة
      const { data: existingAdmin, error: checkError } = await supabase
        .from('company_users')
        .select('id, email, role')
        .eq('company_id', companyId)
        .eq('role', 'owner')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAdmin) {
        console.log('👑 [SUPER_ADMIN] مالك الشركة موجود بالفعل');
        return {
          success: true,
          data: existingAdmin,
          message: 'مالك الشركة موجود بالفعل'
        };
      }

      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(adminData.password, 12);

      // إنشاء المستخدم الأساسي للشركة
      const { data: newAdmin, error: insertError } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          email: adminData.email,
          name: adminData.name,
          password_hash: passwordHash,
          role: 'owner',
          is_active: true,
          permissions: {}, // سيحصل على جميع الصلاحيات من الدور
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ [SUPER_ADMIN] تم إنشاء مالك الشركة بنجاح');
      
      return {
        success: true,
        data: newAdmin,
        message: 'تم إنشاء مالك الشركة بنجاح'
      };
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في إنشاء مالك الشركة:', error);
      return {
        success: false,
        message: 'فشل في إنشاء مالك الشركة'
      };
    }
  }

  /**
   * 👑 تسجيل دخول المدير الأساسي كشركة (Login As Company)
   */
  static async loginAsCompany(
    superAdminId: string,
    companyId: string
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log(`👑 [LOGIN_AS] المدير الأساسي ${superAdminId} يحاول الدخول كشركة ${companyId}`);

      // التحقق من صحة المدير الأساسي
      const { data: superAdmin, error: adminError } = await supabase
        .from('system_admins')
        .select('id, email, name, role')
        .eq('id', superAdminId)
        .eq('is_active', true)
        .single();

      if (adminError || !superAdmin) {
        return {
          success: false,
          message: 'المدير الأساسي غير موجود أو غير نشط'
        };
      }

      // التحقق من وجود الشركة
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        return {
          success: false,
          message: 'الشركة غير موجودة'
        };
      }

      // تسجيل العملية في السجل
      await this.logSuperAdminAction(superAdminId, 'login_as_company', {
        company_id: companyId,
        company_name: company.name,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ [LOGIN_AS] تم تسجيل دخول المدير الأساسي كشركة ${company.name}`);

      return {
        success: true,
        data: {
          company,
          superAdmin: {
            id: superAdmin.id,
            email: superAdmin.email,
            name: superAdmin.name
          },
          loginType: 'super_admin_as_company'
        },
        message: `تم تسجيل الدخول كشركة ${company.name}`
      };

    } catch (error) {
      console.error(`❌ [LOGIN_AS] خطأ في تسجيل الدخول كشركة:`, error);
      return {
        success: false,
        message: 'فشل في تسجيل الدخول كشركة'
      };
    }
  }

  /**
   * 🏢 الحصول على تفاصيل شركة محددة للمدير الأساسي
   */
  static async getCompanyDetails(companyId: string): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log(`🏢 [SUPER_ADMIN] جلب تفاصيل الشركة: ${companyId}`);

      const { data: company, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_subscriptions (
            id,
            status,
            end_date,
            created_at,
            subscription_plans (
              name
            )
          ),
          stores (
            id,
            name,
            is_active,
            created_at
          ),
          company_users (
            id,
            name,
            email,
            role,
            is_active,
            created_at
          ),
          conversations (
            id,
            customer_name,
            created_at,
            last_message_at
          )
        `)
        .eq('id', companyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            message: 'الشركة غير موجودة'
          };
        }
        throw error;
      }

      // جلب عدد المنتجات من المتاجر
      if (company.stores && company.stores.length > 0) {
        const storeIds = company.stores.map((store: any) => store.id);

        const { data: products, error: productsError } = await supabase
          .from('ecommerce_products')
          .select('id, name, status')
          .in('store_id', storeIds);

        if (!productsError) {
          company.products = products || [];
        }
      }

      console.log(`✅ [SUPER_ADMIN] تم جلب تفاصيل الشركة: ${company.name}`);

      return {
        success: true,
        data: company,
        message: `تم جلب تفاصيل الشركة: ${company.name}`
      };

    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في جلب تفاصيل الشركة:', error);
      return {
        success: false,
        message: 'فشل في جلب تفاصيل الشركة'
      };
    }
  }

  /**
   * 📋 الحصول على قائمة جميع الشركات للمدير الأساسي
   */
  static async getAllCompaniesForSuperAdmin(): Promise<{
    success: boolean;
    data?: any[];
    message: string;
  }> {
    try {
      console.log('📋 [SUPER_ADMIN] جلب قائمة جميع الشركات...');

      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          email,
          phone,
          status,
          created_at,
          last_login_at,
          company_subscriptions (
            id,
            status,
            end_date,
            subscription_plans (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ [SUPER_ADMIN] تم جلب ${companies.length} شركة`);

      return {
        success: true,
        data: companies,
        message: `تم جلب ${companies.length} شركة`
      };

    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في جلب الشركات:', error);
      return {
        success: false,
        message: 'فشل في جلب قائمة الشركات'
      };
    }
  }

  /**
   * 📝 تسجيل أنشطة المدير الأساسي
   */
  private static async logSuperAdminAction(
    adminId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('super_admin_logs')
        .insert({
          admin_id: adminId,
          action,
          details,
          ip_address: 'localhost', // يمكن تحسينه لاحقاً
          user_agent: 'system',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('❌ خطأ في تسجيل نشاط المدير الأساسي:', error);
    }
  }

  /**
   * 🔐 تسجيل دخول المستخدم الأساسي للنظام
   */
  static async loginSystemSuperAdmin(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log(`🔐 [SUPER_ADMIN] محاولة تسجيل دخول المستخدم الأساسي: ${email}`);

      // البحث عن المستخدم
      const { data: admin, error: fetchError } = await supabase
        .from('system_admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (fetchError || !admin) {
        return {
          success: false,
          message: 'المستخدم غير موجود أو غير نشط'
        };
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة'
        };
      }

      // تحديث آخر دخول
      await supabase
        .from('system_admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id);

      console.log('✅ [SUPER_ADMIN] تم تسجيل دخول المستخدم الأساسي بنجاح');

      return {
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          type: 'system_admin'
        },
        message: 'تم تسجيل الدخول بنجاح'
      };
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في تسجيل دخول المستخدم الأساسي:', error);
      return {
        success: false,
        message: 'حدث خطأ في تسجيل الدخول'
      };
    }
  }

  /**
   * 📋 الحصول على جميع الشركات (للمستخدم الأساسي)
   */
  static async getAllCompanies(): Promise<{
    success: boolean;
    data?: any[];
    message: string;
  }> {
    try {
      console.log('📋 [SUPER_ADMIN] جلب جميع الشركات...');

      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: companies || [],
        message: 'تم جلب الشركات بنجاح'
      };
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في جلب الشركات:', error);
      return {
        success: false,
        message: 'فشل في جلب الشركات'
      };
    }
  }

  /**
   * 📊 الحصول على إحصائيات النظام
   */
  static async getSystemStats(): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      console.log('📊 [SUPER_ADMIN] جلب إحصائيات النظام...');

      const [companiesResult, usersResult, subscriptionsResult] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('company_users').select('id', { count: 'exact' }),
        supabase.from('company_subscriptions').select('plan_id', { count: 'exact' })
      ]);

      const stats = {
        total_companies: companiesResult.count || 0,
        total_users: usersResult.count || 0,
        total_subscriptions: subscriptionsResult.count || 0,
        last_updated: new Date().toISOString()
      };

      return {
        success: true,
        data: stats,
        message: 'تم جلب الإحصائيات بنجاح'
      };
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في جلب الإحصائيات:', error);
      return {
        success: false,
        message: 'فشل في جلب الإحصائيات'
      };
    }
  }

  /**
   * 🔧 تهيئة النظام عند بدء التشغيل
   */
  static async initializeSystem(): Promise<void> {
    try {
      console.log('🔧 [SUPER_ADMIN] بدء تهيئة النظام...');

      // إنشاء جدول المستخدمين الأساسيين إذا لم يكن موجوداً
      await this.createSystemAdminsTable();

      // إنشاء المستخدم الأساسي
      await this.createSystemSuperAdmin();

      console.log('✅ [SUPER_ADMIN] تم تهيئة النظام بنجاح');
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في تهيئة النظام:', error);
    }
  }

  /**
   * 🗄️ إنشاء جدول المستخدمين الأساسيين
   */
  private static async createSystemAdminsTable(): Promise<void> {
    try {
      // هذا سيتم تنفيذه من خلال Supabase SQL
      console.log('🗄️ [SUPER_ADMIN] التحقق من جدول المستخدمين الأساسيين...');
      
      // يمكن إضافة منطق إنشاء الجدول هنا إذا لزم الأمر
    } catch (error) {
      console.error('❌ [SUPER_ADMIN] خطأ في إنشاء جدول المستخدمين الأساسيين:', error);
    }
  }
}
