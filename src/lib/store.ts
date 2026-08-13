import { supabase } from './supabase/client';
import { Batch, Group, Customer, Installment, Payment, AuditLog } from './types';

// Live Database Fetchers & Mutators
export async function getBatchesFromDB(): Promise<Batch[]> {
  const { data } = await supabase.from('batches').select('*');
  return data || [];
}

export async function getGroupsFromDB(): Promise<Group[]> {
  const { data } = await supabase.from('groups').select('*');
  return data || [];
}

export async function getCustomersFromDB(): Promise<Customer[]> {
  const { data } = await supabase.from('customers').select('*');
  return data || [];
}

export async function getInstallmentsFromDB(): Promise<Installment[]> {
  const { data } = await supabase.from('installments').select('*');
  return data || [];
}

export async function getPaymentsFromDB(): Promise<Payment[]> {
  const { data } = await supabase.from('payments').select('*');
  return data || [];
}

export async function getAuditLogsFromDB(): Promise<AuditLog[]> {
  const { data } = await supabase.from('admin_audit_logs').select('*');
  return data || [];
}
