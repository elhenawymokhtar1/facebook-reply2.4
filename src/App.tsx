
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Responses from "./pages/Responses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import SimpleSettings from "./pages/SimpleSettings";
import Conversations from "./pages/Conversations";
import WhatsAppConversations from "./pages/WhatsAppConversations";

import Orders from "./pages/Orders";
// import TestDiagnosis from "./pages/TestDiagnosis";

import SimpleTestChat from "./pages/SimpleTestChat";
import WhatsAppBaileys from "./pages/WhatsAppBaileys";
import WhatsAppAdvanced from "./pages/WhatsAppAdvanced";
import WhatsAppConnection from "./pages/WhatsAppConnection";
import WhatsAppChatPage from "./pages/WhatsAppChatPage";
import WhatsAppTest from "./pages/WhatsAppTest";
import { WhatsAppAI } from "./pages/WhatsAppAI";
import { GeminiAISettings } from "./pages/GeminiAISettings";
import { FacebookAISettings } from "./pages/FacebookAISettings";

// Company Subscription System
import SubscriptionPlans from "./pages/SubscriptionPlans";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyDashboard from "./pages/CompanyDashboard";
import UpgradePlan from "./pages/UpgradePlan";
import SystemTest from "./pages/SystemTest";
import UserManagement from "./pages/UserManagement";
import AcceptInvitation from "./pages/AcceptInvitation";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminCompanyDetails from "./pages/SuperAdminCompanyDetails";
import TestCompanyDetails from "./pages/TestCompanyDetails";
import DebugCompanyDetails from "./pages/DebugCompanyDetails";
import CompaniesManagement from "./pages/CompaniesManagement";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import BillingManagement from "./pages/BillingManagement";
import PaymentMethods from "./pages/PaymentMethods";
import SubscriptionSchedule from "./pages/SubscriptionSchedule";
import TestButtons from "./pages/TestButtons";
import SimpleSubscriptionPlans from "./pages/SimpleSubscriptionPlans";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import ProtectedRoute, { PublicRoute, PrivateRoute } from "./components/ProtectedRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import PublicLayout from "./components/PublicLayout";

import Categories from "./pages/Categories";
import EcommerceProducts from "./pages/EcommerceProducts";
import TestPage from "./pages/TestPage";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrdersManagement from "./pages/OrdersManagement";
import CouponsManagement from "./pages/CouponsManagement";
import ShippingManagement from "./pages/ShippingManagement";
import EcommerceAnalytics from "./pages/EcommerceAnalytics";
import StoreSetup from "./pages/StoreSetup";
import ProductVariants from "./pages/ProductVariants";
import StoreDashboard from "./pages/StoreDashboard";
import ConnectedPages from "./pages/ConnectedPages";
import StoreManagement from "./pages/StoreManagement";

import NotFound from "./pages/NotFound";
import QuickStartGuide from "./pages/QuickStartGuide";
import { NameUpdateService } from "./services/nameUpdateService";
import { initializeDatabase } from "./utils/setupDatabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // البيانات تبقى fresh لمدة 5 ثواني
      gcTime: 30000, // الاحتفاظ بالـ cache لمدة 30 ثانية
      refetchOnWindowFocus: false, // لا تعيد التحميل عند التركيز على النافذة
      refetchOnMount: false, // لا تعيد التحميل عند mount إذا كانت البيانات fresh
      retry: 2, // إعادة المحاولة مرتين فقط
    },
  },
});

const App = () => {
  console.log('🎯 App component is rendering...');

  useEffect(() => {
    // بدء خدمة تحديث الأسماء التلقائية
    console.log('🚀 بدء تطبيق Facebook Auto Reply');

    try {
      NameUpdateService.startAutoUpdate();
      // إعداد قاعدة البيانات - معطل مؤقتاً للاختبار
      // initializeDatabase();
      console.log('✅ تم تحميل التطبيق بنجاح (بدون تهيئة قاعدة البيانات)');
    } catch (error) {
      console.error('❌ خطأ في بدء التطبيق:', error);
    }

    // تنظيف عند إغلاق التطبيق
    return () => {
      try {
        NameUpdateService.stopAutoUpdate();
        console.log('🔄 تنظيف التطبيق');
      } catch (error) {
        console.error('❌ خطأ في إيقاف التطبيق:', error);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* الصفحات العامة - لا تتطلب تسجيل دخول */}
            <Route path="/company-register" element={<PublicRoute><CompanyRegister /></PublicRoute>} />
            <Route path="/company-login" element={<PublicRoute><CompanyLogin /></PublicRoute>} />
            <Route path="/subscription-plans" element={<PublicRoute><SubscriptionPlans /></PublicRoute>} />
            <Route path="/subscription-checkout" element={<PublicRoute><SubscriptionCheckout /></PublicRoute>} />
            <Route path="/subscription-success" element={<PublicRoute><SubscriptionSuccess /></PublicRoute>} />
            <Route path="/simple-plans" element={<PublicRoute><SimpleSubscriptionPlans /></PublicRoute>} />
            <Route path="/test-buttons" element={<PublicRoute><TestButtons /></PublicRoute>} />
            <Route path="/accept-invitation/:token" element={<PublicRoute><AcceptInvitation /></PublicRoute>} />
            <Route path="/system-test" element={<PublicRoute><SystemTest /></PublicRoute>} />
            <Route path="/test-page" element={<PublicRoute><TestPage /></PublicRoute>} />

            {/* صفحات المستخدم الأساسي */}
            <Route path="/super-admin-login" element={<PublicRoute><SuperAdminLogin /></PublicRoute>} />
            <Route path="/super-admin-dashboard" element={<PublicRoute><SuperAdminDashboard /></PublicRoute>} />
            <Route path="/super-admin-company/:companyId" element={<PublicRoute><SuperAdminCompanyDetails /></PublicRoute>} />
            <Route path="/test-company/:companyId" element={<PublicRoute><TestCompanyDetails /></PublicRoute>} />
            <Route path="/debug-company/:companyId" element={<PublicRoute><DebugCompanyDetails /></PublicRoute>} />
            <Route path="/companies-management" element={<PublicRoute><CompaniesManagement /></PublicRoute>} />

            {/* الصفحات المحمية - تتطلب تسجيل دخول مع Sidebar */}
            <Route path="/" element={<PrivateRoute><AuthenticatedLayout><HomePage /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><AuthenticatedLayout><Index /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/company-dashboard" element={
              <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 لوحة تحكم الشركة</h1>
                      <p className="text-gray-600">مرحباً بك في نظام إدارة الشركة</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 إحصائيات سريعة</h3>
                        <ul className="space-y-2 text-blue-800">
                          <li>• الرسائل هذا الشهر: 1,250</li>
                          <li>• الصفحات المربوطة: 3</li>
                          <li>• المستخدمين النشطين: 5</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ حالة النظام</h3>
                        <ul className="space-y-2 text-green-800">
                          <li>• الخطة: Premium</li>
                          <li>• الحالة: نشط</li>
                          <li>• الأيام المتبقية: 23</li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => window.location.href = '/settings'}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
                      >
                        ⚙️ إعدادات Facebook
                      </button>

                      <button
                        onClick={() => window.location.href = '/whatsapp'}
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"
                      >
                        📱 إعدادات WhatsApp
                      </button>

                      <button
                        onClick={() => window.location.href = '/ecommerce-products'}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors"
                      >
                        🛍️ إدارة المنتجات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/user-management" element={<PrivateRoute><AuthenticatedLayout><UserManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/upgrade-plan" element={<PrivateRoute><AuthenticatedLayout><UpgradePlan /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/subscription-management" element={<PrivateRoute><AuthenticatedLayout><SubscriptionManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/billing-management" element={<PrivateRoute><AuthenticatedLayout><BillingManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/payment-methods" element={<PrivateRoute><AuthenticatedLayout><PaymentMethods /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/subscription-schedule" element={<PrivateRoute><AuthenticatedLayout><SubscriptionSchedule /></AuthenticatedLayout></PrivateRoute>} />

            {/* WhatsApp Routes */}
            <Route path="/conversations" element={<PrivateRoute><AuthenticatedLayout><Conversations /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/responses" element={<PrivateRoute><AuthenticatedLayout><Responses /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><AuthenticatedLayout><Analytics /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><AuthenticatedLayout><Settings /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/settings-full" element={<Settings />} />
            <Route path="/whatsapp-conversations" element={<PrivateRoute><AuthenticatedLayout><WhatsAppConversations /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp" element={<PrivateRoute><AuthenticatedLayout><WhatsAppConnection /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-ai-settings" element={<PrivateRoute><AuthenticatedLayout><WhatsAppAI /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-chat" element={<PrivateRoute><AuthenticatedLayout><WhatsAppChatPage /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-test" element={<PrivateRoute><AuthenticatedLayout><WhatsAppTest /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-advanced" element={<PrivateRoute><AuthenticatedLayout><WhatsAppAdvanced /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-basic" element={<PrivateRoute><AuthenticatedLayout><WhatsAppBaileys /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-ai" element={<PrivateRoute><AuthenticatedLayout><WhatsAppAI /></AuthenticatedLayout></PrivateRoute>} />

            {/* Gemini AI Settings */}
            <Route path="/gemini-ai-settings" element={<PrivateRoute><AuthenticatedLayout><GeminiAISettings /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/whatsapp-gemini-settings" element={<PrivateRoute><AuthenticatedLayout><GeminiAISettings /></AuthenticatedLayout></PrivateRoute>} />

            {/* Facebook Routes */}
            <Route path="/facebook-conversations" element={<PrivateRoute><AuthenticatedLayout><Conversations /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/facebook-settings" element={<PrivateRoute><AuthenticatedLayout><Settings /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/facebook-ai-settings" element={<PrivateRoute><AuthenticatedLayout><FacebookAISettings /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/connected-pages" element={<PrivateRoute><AuthenticatedLayout><ConnectedPages /></AuthenticatedLayout></PrivateRoute>} />

            {/* E-commerce Routes */}
            <Route path="/store-dashboard" element={<PrivateRoute><AuthenticatedLayout><StoreDashboard /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><AuthenticatedLayout><OrdersManagement /></AuthenticatedLayout></PrivateRoute>} />
            {/* <Route path="/test-diagnosis" element={<PrivateRoute><AuthenticatedLayout><TestDiagnosis /></AuthenticatedLayout></PrivateRoute>} /> */}
            <Route path="/simple-test-chat" element={<PrivateRoute><AuthenticatedLayout><SimpleTestChat /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/quick-start-guide" element={<PrivateRoute><AuthenticatedLayout><QuickStartGuide /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><AuthenticatedLayout><Categories /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/ecommerce-products" element={<PrivateRoute><AuthenticatedLayout><EcommerceProducts /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/store-management" element={<PrivateRoute><AuthenticatedLayout><StoreManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/shop" element={<PrivateRoute><AuthenticatedLayout><Shop /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/cart" element={<PrivateRoute><AuthenticatedLayout><Cart /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><AuthenticatedLayout><Checkout /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/order-confirmation/:orderId" element={<PrivateRoute><AuthenticatedLayout><OrderConfirmation /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/coupons" element={<PrivateRoute><AuthenticatedLayout><CouponsManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/shipping" element={<PrivateRoute><AuthenticatedLayout><ShippingManagement /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/ecommerce-analytics" element={<PrivateRoute><AuthenticatedLayout><EcommerceAnalytics /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/store-setup" element={<PrivateRoute><AuthenticatedLayout><StoreSetup /></AuthenticatedLayout></PrivateRoute>} />
            <Route path="/product-variants" element={<PrivateRoute><AuthenticatedLayout><ProductVariants /></AuthenticatedLayout></PrivateRoute>} />

            <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
