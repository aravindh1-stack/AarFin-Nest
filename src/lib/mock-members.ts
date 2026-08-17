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

export const members: Member[] = [
  {
    id: "mem_8842019",
    name: "Arun Kumar",
    initials: "AK",
    phone: "+91 98765 43210",
    memberSince: "Jan 2023",
    scheme: "Palagara Seetu",
    route: "North Zone A",
    totalPendingDues: 15000,
    advanceBalance: 0,
    installments: [
      { cycle: 1, dueDate: "05 Jan 2026", amount: 5000, paidAmount: 5000, status: "PAID" },
      { cycle: 2, dueDate: "05 Feb 2026", amount: 5000, paidAmount: 5000, status: "PAID" },
      { cycle: 3, dueDate: "05 Mar 2026", amount: 5000, paidAmount: 2000, status: "PARTIAL" },
      { cycle: 4, dueDate: "05 Apr 2026", amount: 5000, paidAmount: 0, status: "PENDING" },
      { cycle: 5, dueDate: "05 May 2026", amount: 5000, paidAmount: 0, status: "PENDING" },
      { cycle: 6, dueDate: "05 Jun 2026", amount: 5000, paidAmount: 0, status: "UPCOMING" },
    ],
  },
  {
    id: "mem_8842020",
    name: "Meena Devi",
    initials: "MD",
    phone: "+91 91234 56780",
    memberSince: "Mar 2024",
    scheme: "Vaara Kandhu",
    route: "East Route 4",
    totalPendingDues: 3600,
    advanceBalance: 400,
    installments: [
      { cycle: 8, dueDate: "22 Jul 2026", amount: 1200, paidAmount: 1200, status: "PAID" },
      { cycle: 9, dueDate: "29 Jul 2026", amount: 1200, paidAmount: 1200, status: "PAID" },
      { cycle: 10, dueDate: "05 Aug 2026", amount: 1200, paidAmount: 0, status: "PENDING" },
      { cycle: 11, dueDate: "12 Aug 2026", amount: 1200, paidAmount: 0, status: "PENDING" },
      { cycle: 12, dueDate: "19 Aug 2026", amount: 1200, paidAmount: 0, status: "UPCOMING" },
    ],
  },
  {
    id: "mem_8842021",
    name: "Ravi Shankar",
    initials: "RS",
    phone: "+91 90000 11223",
    memberSince: "Aug 2022",
    scheme: "Dhina Kandhu",
    route: "Central Hub",
    totalPendingDues: 0,
    advanceBalance: 800,
    installments: [
      { cycle: 118, dueDate: "12 Aug 2026", amount: 800, paidAmount: 800, status: "PAID" },
      { cycle: 119, dueDate: "13 Aug 2026", amount: 800, paidAmount: 800, status: "PAID" },
      { cycle: 120, dueDate: "14 Aug 2026", amount: 800, paidAmount: 800, status: "PAID" },
      { cycle: 121, dueDate: "15 Aug 2026", amount: 800, paidAmount: 0, status: "UPCOMING" },
    ],
  },
  {
    id: "mem_8842022",
    name: "Lakshmi Priya",
    initials: "LP",
    phone: "+91 98111 22334",
    memberSince: "Nov 2023",
    scheme: "Palagara Seetu",
    route: "West Zone B",
    totalPendingDues: 10000,
    advanceBalance: 0,
    installments: [
      { cycle: 1, dueDate: "10 May 2026", amount: 5000, paidAmount: 5000, status: "PAID" },
      { cycle: 2, dueDate: "10 Jun 2026", amount: 5000, paidAmount: 0, status: "PENDING" },
      { cycle: 3, dueDate: "10 Jul 2026", amount: 5000, paidAmount: 0, status: "PENDING" },
      { cycle: 4, dueDate: "10 Aug 2026", amount: 5000, paidAmount: 0, status: "UPCOMING" },
    ],
  },
  {
    id: "mem_8842023",
    name: "Suresh Babu",
    initials: "SB",
    phone: "+91 99887 76655",
    memberSince: "Feb 2025",
    scheme: "Vaara Kandhu",
    route: "North Zone A",
    totalPendingDues: 1200,
    advanceBalance: 0,
    installments: [
      { cycle: 21, dueDate: "01 Aug 2026", amount: 1200, paidAmount: 1200, status: "PAID" },
      { cycle: 22, dueDate: "08 Aug 2026", amount: 1200, paidAmount: 0, status: "PENDING" },
      { cycle: 23, dueDate: "15 Aug 2026", amount: 1200, paidAmount: 0, status: "UPCOMING" },
    ],
  },
];
