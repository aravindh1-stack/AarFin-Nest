import { supabaseAdmin } from '../config/supabaseAdmin';

export const CustomersBackendService = {
  // Get all customer records
  async getAllCustomers() {
    const { data, error } = await supabaseAdmin.from('customers').select('*');
    if (error) throw error;
    return data || [];
  },

  // Create new customer record
  async createCustomer(customerPayload: any) {
    const { data, error } = await supabaseAdmin.from('customers').insert([customerPayload]);
    if (error) throw error;
    return data;
  },

  // Update existing customer record
  async updateCustomer(id: string, updatePayload: any) {
    const { data, error } = await supabaseAdmin.from('customers').update(updatePayload).eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const BatchesBackendService = {
  async getAllBatches() {
    const { data, error } = await supabaseAdmin.from('batches').select('*');
    if (error) throw error;
    return data || [];
  },

  async createBatch(batchPayload: any) {
    const { data, error } = await supabaseAdmin.from('batches').insert([batchPayload]);
    if (error) throw error;
    return data;
  }
};

export const GroupsBackendService = {
  async getAllGroups() {
    const { data, error } = await supabaseAdmin.from('groups').select('*');
    if (error) throw error;
    return data || [];
  },

  async createGroup(groupPayload: any) {
    const { data, error } = await supabaseAdmin.from('groups').insert([groupPayload]);
    if (error) throw error;
    return data;
  },

  async updateGroup(id: string, updatePayload: any) {
    const { data, error } = await supabaseAdmin.from('groups').update(updatePayload).eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const PaymentsBackendService = {
  async getAllPayments() {
    const { data, error } = await supabaseAdmin.from('payments').select('*');
    if (error) throw error;
    return data || [];
  },

  async recordPayment(paymentPayload: any) {
    const { data, error } = await supabaseAdmin.from('payments').insert([paymentPayload]);
    if (error) throw error;
    return data;
  }
};
