export interface CompanyOption {
  id: number;
  code: string;
  legalName: string;
  brandName?: string;
  taxId?: string;
}

export interface InvestmentDeclaration {
  id?: number;
  companyId?: number;
  employeeId?: number;
  financialYear: string;
  assessmentYear: string;
  regime: 'NEW' | 'OLD';
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

  // Section 80C
  sec80cEpf: number;
  sec80cPpf: number;
  sec80cElss: number;
  sec80cLifeInsurance: number;
  sec80cHousingPrincipal: number;
  sec80cTuitionFees: number;
  sec80cNscFd: number;
  sec80cTotal: number;
  sec80cEligible: number;

  // Section 80CCD(1B) - NPS
  sec80ccdNps: number;
  sec80ccdEligible: number;

  // Section 80D - Health Insurance
  sec80dSelfFamily: number;
  sec80dParents: number;
  sec80dPreventiveCheckup: number;
  sec80dTotal: number;
  sec80dEligible: number;

  // Section 24(b) - Home Loan Interest
  sec24HomeLoanInterest: number;
  sec24Eligible: number;

  // HRA (Section 10(13A))
  annualRentPaid: number;
  landlordName?: string;
  landlordPan?: string;
  rentalCityType: 'METRO' | 'NON_METRO';
  hraExemptionEligible: number;

  // Other Deductions
  sec80eEducationLoan: number;
  sec80gDonations: number;
  sec80ttaSavingsInterest: number;

  // Totals & Audit
  totalDeclaredDeductions: number;
  totalEligibleDeductions: number;
  remarks?: string;
  hrNotes?: string;
  submittedAt?: string;
  verifiedAt?: string;

  // Joined Employee info
  employeeCode?: string;
  employeeName?: string;
  departmentName?: string;
  designationName?: string;
  annualCtc?: number;
}

export interface TaxSlabBreakdown {
  slabRange: string;
  ratePercent: number;
  slabTaxableAmount: number;
  slabTaxAmount: number;
}

export interface RegimeComputation {
  regimeName: string;
  grossSalary: number;
  standardDeduction: number;
  chapterViADeductions: number;
  hraExemption: number;
  homeLoanInterestDeduction: number;
  professionalTax: number;
  otherDeductions: number;
  totalDeductions: number;
  taxableIncome: number;
  slabBreakdown: TaxSlabBreakdown[];
  baseIncomeTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  healthAndEducationCess: number;
  totalAnnualTax: number;
  monthlyTds: number;
}

export interface TaxCalculationResponse {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  financialYear: string;
  assessmentYear: string;
  annualCtc: number;
  grossSalary: number;
  selectedRegime: 'NEW' | 'OLD';
  recommendedRegime: 'NEW' | 'OLD';
  taxSavingsWithRecommendation: number;
  recommendationReason: string;
  newRegime: RegimeComputation;
  oldRegime: RegimeComputation;
}

export interface TdsQuarterSummary {
  quarter: string;
  totalAmountCredited: number;
  taxDeducted: number;
  taxDeposited: number;
  bsrCode: string;
  challanDate: string;
  challanSerialNo: string;
}

export interface Form16Response {
  certificateNumber: string;
  lastUpdatedOn: string;
  companyId: number;
  employerLegalName: string;
  employerBrandName: string;
  employerAddress: string;
  employerCityState: string;
  employerPan: string;
  employerTan: string;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  employeePan: string;
  employeeDesignation: string;
  employeeDepartment: string;
  employeeAddress: string;
  financialYear: string;
  assessmentYear: string;
  periodFrom: string;
  periodTo: string;
  chosenRegime: string;
  quarterlyTds: TdsQuarterSummary[];
  totalTdsDeposited: number;
  grossSalary: number;
  allowancesUnderSection10: number;
  balanceSalary: number;
  standardDeduction: number;
  professionalTax: number;
  incomeChargeableUnderSalaries: number;
  deduction80C: number;
  deduction80CCD: number;
  deduction80D: number;
  deductionSection24: number;
  otherChapterViADeductions: number;
  totalDeductionsChapterViA: number;
  totalTaxableIncome: number;
  taxOnTotalIncome: number;
  rebateUnder87A: number;
  taxAfterRebate: number;
  cess4Percent: number;
  netTaxPayable: number;
  totalTaxDeductedAtSource: number;
  refundOrBalanceDue: number;
  verificationPlace: string;
  verificationDate: string;
  signatoryName: string;
  signatoryDesignation: string;
}

export interface Form12bbResponse {
  financialYear: string;
  assessmentYear: string;
  employeeId: number;
  employeeName: string;
  employeePan: string;
  employeeDesignation: string;
  employeeDepartment: string;
  employeeAddress: string;
  employerLegalName: string;
  employerPan: string;
  employerTan: string;
  employerAddress: string;
  annualRentPaid: number;
  landlordName?: string;
  landlordPan?: string;
  landlordAddress?: string;
  rentalCityType: string;
  ltaClaimAmount: number;
  homeLoanInterest: number;
  lenderName?: string;
  lenderPan?: string;
  sec80cTotal: number;
  sec80cEligible: number;
  sec80ccdNps: number;
  sec80dMedical: number;
  sec80eEducation: number;
  otherDeductions: number;
  totalClaims: number;
  declarationDate: string;
  declarationPlace: string;
  status: string;
}
