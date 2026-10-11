import type { InstallmentStatus } from "@/components/status-pill";

export interface Installment {
  cycle: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: InstallmentStatus;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  phone: string;
  memberSince: string;
  scheme: string;
  route: string;
  totalPendingDues: number;
  advanceBalance: number;
  installments: Installment[];
}

// All data strictly loaded from database — no mock data permitted
export const members: Member[] = [];
