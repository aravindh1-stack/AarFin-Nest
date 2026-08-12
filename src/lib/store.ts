import { Batch, Customer, Enrollment, Installment, Payment, AuditLog, Group } from './types';

export const initialBatches: Batch[] = [
  {
    id: 'b1',
    batch_code: 'SEETU-TRICHY-01',
    batch_name: 'Trichy Gold Seetu Batch A',
    scheme_type: 'PALAGARA_SEETU',
    total_cycles: 20,
    installment_amount: 5000,
    frequency_type: 'MONTHLY',
    renewal_day: '5',
    start_date: '2026-01-01',
    end_date: '2027-08-01',
    status: 'ACTIVE',
    group_count: 3,
    customer_count: 24,
    total_collected: 850000,
    target_amount: 1000000,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'b2',
    batch_code: 'VK-CBE-12',
    batch_name: 'Coimbatore Vaara Kandhu #12',
    scheme_type: 'VAARA_KANDHU',
    total_cycles: 12,
    installment_amount: 2500,
    frequency_type: 'WEEKLY',
    renewal_day: 'Monday',
    start_date: '2026-06-01',
    end_date: '2026-08-24',
    status: 'ACTIVE',
    group_count: 2,
    customer_count: 18,
    total_collected: 320000,
    target_amount: 450000,
    created_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'b3',
    batch_code: 'DK-MDU-100',
    batch_name: 'Madurai Market Dhina Kandhu',
    scheme_type: 'DHINA_KANDHU',
    total_cycles: 100,
    installment_amount: 500,
    frequency_type: 'DAILY',
    start_date: '2026-05-01',
    end_date: '2026-08-10',
    status: 'ACTIVE',
    group_count: 4,
    customer_count: 40,
    total_collected: 1450000,
    target_amount: 2000000,
    created_at: '2026-05-01T00:00:00Z'
  }
];

export const initialGroups: Group[] = [
  {
    id: 'g1',
    batch_id: 'b1',
    group_name: 'Trichy Central Route A',
    group_code: 'GRP-TRC-01',
    route_name: 'West Car Street & Main Bazaar',
    display_order: 1,
    collection_agent: 'K. Senthil',
    customer_count: 10,
    batch_name: 'Trichy Gold Seetu Batch A',
    created_at: '2026-01-02T00:00:00Z'
  },
  {
    id: 'g2',
    batch_id: 'b1',
    group_name: 'Srirangam Route B',
    group_code: 'GRP-SRG-02',
    route_name: 'Temple Gate & North Street',
    display_order: 2,
    collection_agent: 'M. Velu',
    customer_count: 8,
    batch_name: 'Trichy Gold Seetu Batch A',
    created_at: '2026-01-03T00:00:00Z'
  },
  {
    id: 'g3',
    batch_id: 'b2',
    group_name: 'Gandhipuram Commercial Route',
    group_code: 'GRP-CBE-01',
    route_name: 'Cross Cut Road & 100ft Road',
    display_order: 1,
    collection_agent: 'R. Rajesh',
    customer_count: 12,
    batch_name: 'Coimbatore Vaara Kandhu #12',
    created_at: '2026-06-02T00:00:00Z'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'c1',
    customer_code: 'CUST-001',
    full_name: 'S. Ramanathan',
    phone_number: '+91 98421 10293',
    address: 'No. 45, West Car Street, Trichy',
    id_proof_number: '3920-1928-3849',
    status: 'ACTIVE',
    total_paid: 65000,
    pending_dues: 5000,
    created_at: '2026-01-05T00:00:00Z'
  },
  {
    id: 'c2',
    customer_code: 'CUST-002',
    full_name: 'M. Kaliappan',
    phone_number: '+91 97892 44321',
    address: 'Shop 12, Main Bazaar, Madurai',
    id_proof_number: '8821-4019-2231',
    status: 'ACTIVE',
    total_paid: 45000,
    pending_dues: 0,
    created_at: '2026-01-08T00:00:00Z'
  },
  {
    id: 'c3',
    customer_code: 'CUST-003',
    full_name: 'K. Meenakshi Sundaram',
    phone_number: '+91 94431 88901',
    address: '14 Cross Road, Gandhipuram, Coimbatore',
    id_proof_number: '5510-9923-1120',
    status: 'ACTIVE',
    total_paid: 12500,
    pending_dues: 2500,
    created_at: '2026-06-02T00:00:00Z'
  }
];

export const initialInstallments: Installment[] = [
  {
    id: 'inst-1',
    enrollment_id: 'e1',
    customer_id: 'c1',
    batch_id: 'b1',
    installment_number: 1,
    due_date: '2026-01-05',
    amount: 5000,
    paid_amount: 5000,
    balance_amount: 0,
    status: 'PAID',
    paid_date: '2026-01-04T10:30:00Z',
    customer_name: 'S. Ramanathan',
    batch_name: 'Trichy Gold Seetu Batch A'
  },
  {
    id: 'inst-2',
    enrollment_id: 'e1',
    customer_id: 'c1',
    batch_id: 'b1',
    installment_number: 2,
    due_date: '2026-02-05',
    amount: 5000,
    paid_amount: 5000,
    balance_amount: 0,
    status: 'PAID',
    paid_date: '2026-02-05T14:20:00Z',
    customer_name: 'S. Ramanathan',
    batch_name: 'Trichy Gold Seetu Batch A'
  },
  {
    id: 'inst-3',
    enrollment_id: 'e1',
    customer_id: 'c1',
    batch_id: 'b1',
    installment_number: 3,
    due_date: '2026-03-05',
    amount: 5000,
    paid_amount: 2500,
    balance_amount: 2500,
    status: 'PARTIAL',
    customer_name: 'S. Ramanathan',
    batch_name: 'Trichy Gold Seetu Batch A'
  },
  {
    id: 'inst-4',
    enrollment_id: 'e1',
    customer_id: 'c1',
    batch_id: 'b1',
    installment_number: 4,
    due_date: '2026-08-10',
    amount: 5000,
    paid_amount: 0,
    balance_amount: 5000,
    status: 'PENDING',
    customer_name: 'S. Ramanathan',
    batch_name: 'Trichy Gold Seetu Batch A'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'p1',
    receipt_no: 'REC-20260811-4921',
    customer_id: 'c1',
    batch_id: 'b1',
    enrollment_id: 'e1',
    amount_paid: 5000,
    payment_date: '2026-08-11T16:00:00Z',
    payment_method: 'UPI',
    reference_no: 'UPI/692019284',
    notes: 'Monthly cycle payment via PhonePe',
    customer_name: 'S. Ramanathan',
    batch_name: 'Trichy Gold Seetu Batch A'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'a1',
    admin_id: 'adm-001',
    action: 'RECORD_PAYMENT_FIFO',
    entity_type: 'PAYMENT',
    entity_id: 'REC-20260811-4921',
    details: { customer: 'S. Ramanathan', amount: 5000, method: 'UPI' },
    created_at: '2026-08-11T16:00:00Z'
  }
];
