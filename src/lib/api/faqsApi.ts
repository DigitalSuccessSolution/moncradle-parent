import { apiClient } from '@/lib/apiClient';

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  targetApp: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export const getFaqs = async (targetApp: string = 'parent'): Promise<Faq[]> => {
  try {
    const response = await apiClient.get(`/faqs?targetApp=${targetApp}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.filter((f: Faq) => f.isActive);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return [];
  }
};
