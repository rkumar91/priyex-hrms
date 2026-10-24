export interface SaasConsoleOverview {
  totalTenants: number;
  activeTenants: number;
  totalSubscriptions: number;
  totalSubscribers?: number;
  totalWorkforceEmployees?: number;
  pendingCustomerRequests?: number;
  openCustomerRequests?: number;
  totalLeads: number;
  newLeads?: number;
  demosScheduled?: number;
  activeMrr: number;
  activeArr: number;
  estimatedArr?: number;
  overdueReceivables: number;
  totalCollectedRevenue: number;
  activeContractsCount: number;
  totalContractValue: number;
}

export interface SaasCommercialAccount {
  id: number;
  accountRef: string;
  accountName: string;
  legalName?: string;
  tenantSlug?: string;
  linkedCompanyCode?: string;
  linkedCompanyId?: number;
  lifecycleStatus: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  businessDomain?: string;
  taxId?: string;
  gstin?: string;
  industry?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  employeeCount?: number;
  activeEmployeeCount?: number;
  licensedSeats?: number;
  activePlanName?: string;
  activePlanCode?: string;
  annualContractValue?: number;
  dropReason?: string;
  dropNotes?: string;
  dropDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaasPlan {
  id: number;
  planCode: string;
  planName: string;
  billingInterval?: 'MONTHLY' | 'ANNUAL';
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  basePrice?: number;
  pricePerSeat?: number;
  perSeatPrice?: number;
  minSeats?: number;
  maxSeatsIncluded?: number;
  storageGbIncluded?: number;
  featuresSummary?: string;
  featuresJson?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SaasSubscription {
  id: number;
  subscriptionRef: string;
  accountId: number;
  accountName?: string;
  planId: number;
  planCode?: string;
  planName?: string;
  status: string;
  seatsLicensed?: number;
  allocatedSeats?: number;
  periodStart?: string;
  periodEnd?: string;
  nextBillingDate?: string;
  paymentMethod?: string;
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaasContract {
  id: number;
  contractRef: string;
  accountId: number;
  accountName?: string;
  contractType: string;
  title: string;
  amount?: number;
  contractAmount?: number;
  billingStatus: string;
  startDate?: string;
  endDate?: string;
  slaResponseHours?: number;
  termsSummary?: string;
  scopeSummary?: string;
  createdAt?: string;
}

export interface SaasInvoice {
  id: number;
  invoiceNumber: string;
  accountId: number;
  accountName?: string;
  subscriptionId?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  paymentReference?: string;
  createdAt?: string;
}

export interface SaasCustomerRequest {
  id: number;
  requestRef: string;
  accountId?: number;
  accountName?: string;
  requestType: string;
  priority: string;
  status: string;
  subject?: string;
  title?: string;
  details?: string;
  description?: string;
  createdAt?: string;
}

export interface SaasAuditEvent {
  id: number;
  actor?: string;
  actorEmail?: string;
  action?: string;
  actionType?: string;
  entityType?: string;
  targetEntity?: string;
  entityId?: string;
  targetId?: string;
  details?: string;
  summary?: string;
  ipAddress?: string;
  createdAt?: string;
}

export interface LeadInquiry {
  id: number;
  inquiryRef?: string;
  fullName: string;
  companyName: string;
  workEmail: string;
  phone?: string;
  phoneNumber?: string;
  companySize?: number;
  employeeCount?: string | number;
  city?: string;
  inquiryType?: string;
  status?: string;
  leadStatus?: string;
  message?: string;
  createdAt?: string;
}
