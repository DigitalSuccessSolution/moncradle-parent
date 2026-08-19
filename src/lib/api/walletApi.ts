import { apiClient } from "@/lib/apiClient";

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface Wallet {
  _id: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export async function getWallet(): Promise<Wallet> {
  const response = await apiClient.get('/wallet');
  return response.data.data;
}

export async function createTransaction(data: { amount: number; type: 'credit' | 'debit'; description: string }): Promise<WalletTransaction> {
  const response = await apiClient.post('/wallet/transaction', data);
  return response.data.data;
}
