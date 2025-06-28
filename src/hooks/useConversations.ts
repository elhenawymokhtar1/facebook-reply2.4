
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCurrentCompany";

export interface Conversation {
  id: string;
  facebook_page_id: string;
  customer_name: string;
  customer_facebook_id: string;
  last_message: string | null;
  last_message_at: string;
  is_online: boolean;
  unread_count: number;
  conversation_status?: 'active' | 'pending' | 'resolved' | 'spam' | 'archived';
  page_id: string;
  created_at: string;
  updated_at: string;
  page_name?: string;
  page_picture_url?: string;
}

// دالة للتحقق من كون الشركة جديدة (أقل من 7 أيام)
const isCompanyNew = (createdAt?: string): boolean => {
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  return diffInDays <= 7; // شركة جديدة إذا كانت أقل من 7 أيام
};

export const useConversations = () => {
  const queryClient = useQueryClient();
  const { company } = useCurrentCompany();

  const { data: conversations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', company?.id],
    queryFn: async () => {
      // التأكد من وجود معلومات الشركة
      if (!company?.id) {
        console.log('❌ لا توجد معلومات شركة');
        return [];
      }

      console.log(`🔍 جلب المحادثات للشركة: ${company.name} (${company.id})`);

      // تعطيل فلترة الشركات الجديدة مؤقتاً لعرض البيانات التجريبية
      // if (isCompanyNew(company.created_at)) {
      //   console.log('🆕 شركة جديدة - لا توجد محادثات بعد');
      //   return [];
      // }

      // استخدام API endpoint مع فلترة الشركة
      try {
        const response = await fetch(`/api/facebook/conversations?company_id=${encodeURIComponent(company.id)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📊 تم جلب ${data?.length || 0} محادثة للشركة ${company.name} من API`);

        return data || [];
      } catch (error) {
        console.error('خطأ في جلب المحادثات من API:', error);
        throw error;
      }
    },
    staleTime: 30000, // البيانات تبقى fresh لمدة 30 ثانية
    cacheTime: 300000, // البيانات تبقى في الكاش لمدة 5 دقائق
    refetchOnWindowFocus: false, // لا تعيد التحميل عند التركيز على النافذة
    retry: 2, // إعادة المحاولة مرتين فقط
  });

  // استمع للتحديثات المباشرة للمحادثات
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Throttle updates - لا تحديث أكثر من مرة كل 3 ثواني
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // تحديث حالة المحادثة
  const updateConversationStatus = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: string }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ conversation_status: status })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
    updateConversationStatus
  };
};
