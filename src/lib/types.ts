export type SchemeType = 'PALAGARA_SEETU' | 'VAARA_KANDHU' | 'DHINA_KANDHU';
export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type BatchStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'SKIPPED' | 'UPCOMING';
export type LateJoinerPolicy = 'CARRY_PREVIOUS_PENDING' | 'SKIP_PREVIOUS_DISALLOWED' | 'START_FROM_JOIN_DATE';

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export interface Batch {
  id: string;
  batch_code: string;
  batch_name: string;
  scheme_type: SchemeType;
  total_cycles: number;
  installment_amount: number;
  frequency_type: FrequencyType;
  renewal_day?: string;
  start_date: string;
  end_date: string;
  status: BatchStatus;
  group_count?: number;
  customer_count?: number;
  total_collected?: number;
  target_amount?: number;
  created_at: string;
}

export interface Group {
  id: string;
  batch_id: string;
  group_name: string;
  group_code: string;
  route_name: string;
  display_order?: number;
  collection_agent?: string;
  customer_count?: number;
  batch_name?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone_number: string;
  alt_phone_number?: string;
  address?: string;
  id_proof_number?: string;
  internal_notes?: string;
  status: 'ACTIVE' | 'DEFAULTED' | 'INACTIVE';
  total_paid?: number;
  pending_dues?: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  customer_id: string;
  batch_id: string;
  group_id?: string;
  group_name?: string;
  enrollment_date: string;
  late_joiner_policy: LateJoinerPolicy;
  total_committed_amount: number;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  customer?: Customer;
  batch?: Batch;
}

export interface Installment {
  id: string;
  enrollment_id?: string;
  customer_id?: string;
  batch_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  balance_amount: number;
  status: InstallmentStatus;
  paid_date?: string;
  customer_name?: string;
  batch_name?: string;
}

export interface Payment {
  id: string;
  receipt_no: string;
  customer_id: string;
  batch_id: string;
  enrollment_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  reference_no?: string;
  notes?: string;
  customer_name?: string;
  batch_name?: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  created_at: string;
}
