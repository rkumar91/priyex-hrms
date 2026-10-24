import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Building2,
  Lock,
  Users,
  CalendarCheck,
  CircleDollarSign,
  Palmtree,
  Award,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  Database,
  Key,
  Layers,
  BookOpen,
  HelpCircle,
  FileCheck,
  Check,
  Clock,
  Compass,
  Briefcase
} from 'lucide-react';

export interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlowId?: string;
}

export interface WorkflowGuideItem {
  id: string;
  number: string;
  title: string;
  shortName: string;
  tagline: string;
  category: 'Infrastructure' | 'Identity' | 'Operations' | 'Finance' | 'Governance';
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderColor: string;
  overview: string;
  architecturePoints: string[];
  operationalSteps: {
    step: string;
    actor: string;
    description: string;
    systemAction: string;
  }[];
  statutoryOrSecurityRules: string[];
  keyApiEndpoints: string[];
  bestPractices: string[];
}

export const PLATFORM_WORKFLOWS: WorkflowGuideItem[] = [
  {
    id: 'multitenant',
    number: '01',
    title: 'Multi-Tenant Architecture & Data Perimeter Isolation',
    shortName: 'Multi-Tenant SaaS',
    tagline: 'Cryptographically bounded tenant isolation with zero cross-tenant data leakage',
    category: 'Infrastructure',
    icon: Building2,
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50 text-blue-700',
    borderColor: 'border-blue-200',
    overview:
      'Priyex HRMS is engineered on a multi-tenant cloud SaaS model. Each subscribing organization operates inside a dedicated logical boundary where all tables (employees, attendances, payroll runs, documents) are partitioned by tenant IDs and enforced through Hibernate tenancy filters and Spring Security perimeters.',
    architecturePoints: [
      'Logical Schema Isolation: Database records include foreign key tenant association indexed for sub-millisecond multi-tenant partitioning.',
      'Custom Domain Resolution: Domain detection engine extracts company identity from user email addresses or designated vanity subdomains (e.g. acme.priyex.com).',
      'Client White-Labeling: Real-time injection of company brand logos, corporate color themes, company legal names, and dynamic approval structures.',
      'SaaS Provisioning: Automated workspace provisioning with default statutory rules, holiday schedules, and base department structures.'
    ],
    operationalSteps: [
      {
        step: 'Tenant Onboarding',
        actor: 'Platform Administrator',
        description: 'New client organization profile created with registered company code, primary email domain, and corporate legal address.',
        systemAction: 'Generates isolated tenant perimeter, seeds default leave types, statutory contribution settings, and system roles.'
      },
      {
        step: 'Domain Binding',
        actor: 'Tenant Administrator',
        description: 'Organization maps corporate email domains (e.g. @yourcompany.com) to their tenant workspace.',
        systemAction: 'Enables real-time domain lookups during sign-in, auto-detecting the tenant code upon email entry.'
      },
      {
        step: 'Policy Customization',
        actor: 'HR Leadership',
        description: 'Company configures working hours, geofence radius, leave quotas, and approval escalation levels.',
        systemAction: 'Persists tenant-level configuration records cached in memory for zero-overhead policy evaluation.'
      }
    ],
    statutoryOrSecurityRules: [
      'Cross-tenant queries are blocked at the persistence layer using parameter binding and Spring Security filters.',
      'Data encryption at rest (AES-256) and TLS 1.3 encryption in transit for all multi-tenant transactions.',
      'Tenant data isolation audits comply with SOC 2 Type II and ISO 27001 data residency guidelines.'
    ],
    keyApiEndpoints: [
      'GET /api/v1/tenant/detect-domain?domain={domain}',
      'GET /api/v1/tenant/validate-company?code={code}',
      'GET /api/v1/tenant/branding'
    ],
    bestPractices: [
      'Always bind official company email domains to prevent unauthorized employee sign-ins.',
      'Review tenant-level audit logs periodically to observe administrative policy revisions.'
    ]
  },
  {
    id: 'auth-sso',
    number: '02',
    title: 'Identity Resolution, SSO & Cryptographic JWT Authentication',
    shortName: 'Auth & Security',
    tagline: 'Multi-factor organization validation and stateless JWT credential tokens',
    category: 'Identity',
    icon: Lock,
    color: 'from-indigo-600 to-purple-600',
    bgLight: 'bg-indigo-50 text-indigo-700',
    borderColor: 'border-indigo-200',
    overview:
      'Authentication in Priyex strictly validates three security attributes: the Organization Code, the Corporate Work Email, and the User Password or SSO Assertion. Once verified, the platform generates a signed JSON Web Token (JWT) encapsulating tenant context and role authorizations.',
    architecturePoints: [
      '3-Factor Verification Handshake: Request validation requires matching company identifier, email domain alignment, and argon2/BCrypt hashed password.',
      'Domain Auto-Resolution: Dynamic UI client-side auto-suggest matches work email suffix to registered company code to prevent user error.',
      'Cryptographic JWT Bearer: Signed with HMAC-SHA512 containing company ID, user ID, role claim, and expiry timestamps.',
      'Session Invalidation: Secure logout flushes client-side state and redirects directly to the public home portal without residual tokens.'
    ],
    operationalSteps: [
      {
        step: 'Portal Access',
        actor: 'Employee / Administrator',
        description: 'User enters work email address on the secure login interface.',
        systemAction: 'Engine identifies email domain, auto-fills or verifies Organization Code, and loads corporate visual badge.'
      },
      {
        step: 'Credential Evaluation',
        actor: 'Priyex Auth Service',
        description: 'Backend verifies password hash against tenant-scoped user credentials table.',
        systemAction: 'Validates active employment status; rejects suspended or terminated user accounts.'
      },
      {
        step: 'Token Issuance',
        actor: 'API Gateway',
        description: 'Issues short-lived JWT access token and companion refresh token cookie.',
        systemAction: 'Client stores session state in secure memory and routes user to role-specific dashboard.'
      }
    ],
    statutoryOrSecurityRules: [
      'Passwords must contain a minimum of 8 characters, uppercase, lowercase, numbers, and symbols.',
      'Account lockouts trigger after 5 consecutive failed sign-in attempts.',
      'All authentication events are recorded in immutable security audit logs with source IP and user agent.'
    ],
    keyApiEndpoints: [
      'POST /api/v1/auth/login (Payload: companyCode, email, password)',
      'POST /api/v1/auth/refresh-token',
      'POST /api/v1/auth/logout'
    ],
    bestPractices: [
      'Never share administrative credentials; use delegated role-based accounts for team members.',
      'Enable session timeout policies aligned with corporate information security standards.'
    ]
  },
  {
    id: 'employee-lifecycle',
    number: '03',
    title: 'Employee Master Directory & Lifecycle Management',
    shortName: 'Employee Lifecycle',
    tagline: 'Comprehensive hire-to-retire digital records, org charts & document vaults',
    category: 'Operations',
    icon: Users,
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50 text-emerald-700',
    borderColor: 'border-emerald-200',
    overview:
      'The Core HR module orchestrates the complete employee journey from digital onboarding, automated employee code generation, digital document vault storage, to probation tracking, organizational hierarchy reporting, and profile change workflows.',
    architecturePoints: [
      'Automated Code Generation: Configurable employee numbering series (e.g. TCS-001, PRX-1002) generated sequentially with tenant prefixes.',
      'Document Vault: Encrypted digital storage for statutory identity documents (Aadhaar, PAN, Passport), educational certificates, and experience letters.',
      'Hierarchical Org Chart: Dynamic tree visualization showing reporting managers, team structures, and designation bands.',
      'Lifecycle Status Engine: Managed state transitions across PROBATION, CONFIRMED, NOTICE_PERIOD, SUSPENDED, and EXITED.'
    ],
    operationalSteps: [
      {
        step: 'Candidate Conversion',
        actor: 'HR Administrator',
        description: 'HR initiates new hire profile with basic personal details, designation, department, and salary package.',
        systemAction: 'Generates unique employee ID, provisions login account, and dispatches welcome onboarding email.'
      },
      {
        step: 'Digital Document Submission',
        actor: 'New Employee',
        description: 'Employee uploads government ID proofs, bank details (IFSC, Account Number), and emergency contacts.',
        systemAction: 'Validates file sizes and MIME types; stores files securely in encrypted document storage.'
      },
      {
        step: 'Probation & Confirmation',
        actor: 'Manager & HR',
        description: 'Manager conducts 90/180-day probation review and submits confirmation approval.',
        systemAction: 'Updates employee status to CONFIRMED and unlocks full annual leave entitlement quotas.'
      }
    ],
    statutoryOrSecurityRules: [
      'Permanent Account Number (PAN) and Aadhaar numbers masked in non-administrative viewports.',
      'Bank account information changes require two-step HR verification to prevent diversion fraud.',
      'Employee records retained in accordance with statutory labor law compliance timelines.'
    ],
    keyApiEndpoints: [
      'GET /api/v1/employees (Paginated with search & department filters)',
      'POST /api/v1/employees (Create new employee profile)',
      'PUT /api/v1/employees/{id}/confirm (Probation confirmation)',
      'GET /api/v1/employees/{id}/documents (Encrypted document vault)'
    ],
    bestPractices: [
      'Verify bank IFSC codes against RBI database before the first monthly payroll cycle.',
      'Maintain up-to-date reporting manager links to ensure approval workflows route without delay.'
    ]
  },
  {
    id: 'attendance-geofence',
    number: '04',
    title: 'Biometric Attendance, Geofencing & Shift Rosters',
    shortName: 'Attendance & Roster',
    tagline: 'Real-time clock-in capture with GPS geofence radar and biometric hardware sync',
    category: 'Operations',
    icon: CalendarCheck,
    color: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-50 text-amber-700',
    borderColor: 'border-amber-200',
    overview:
      'Workforce attendance is reconciled continuously through dual ingestion channels: physical biometric IoT devices (ZKTeco, Essl) and mobile GPS geofenced clock-ins. Built-in shift scheduling and regularization dispute flows ensure accurate timekeeping for payroll.',
    architecturePoints: [
      'GPS Geofence Perimeter: Office coordinates (Latitude, Longitude) configured with allowed punch radius (50m to 500m). Prevents mock location spoofing.',
      'Biometric Push Protocol: IoT device listener parses raw attendance punches and reconciles them against active employee codes.',
      'Shift Engine: Supports general, rotational, morning, and night shifts with custom grace periods (e.g. 15-minute late-in tolerance).',
      'Continuous Presence Reconciliation: System tracks Half-Day, Present, Absent, and On-Duty statuses updated in real time.'
    ],
    operationalSteps: [
      {
        step: 'Daily Clock-In',
        actor: 'Employee',
        description: 'Employee touches biometric terminal or clicks Clock-In on the mobile/web interface within office geofence.',
        systemAction: 'Calculates distance to designated office center; logs timestamp and marks attendance status as PRESENT.'
      },
      {
        step: 'Shift Exception Detection',
        actor: 'Attendance Engine',
        description: 'Engine scans daily punches against assigned shift schedules.',
        systemAction: 'Flags late arrivals, early departures, or missing clock-outs for managerial review.'
      },
      {
        step: 'Regularization Request',
        actor: 'Employee & Manager',
        description: 'Employee submits regularization with justification for outdoor client meetings or technical delays.',
        systemAction: 'On manager approval, recalculates total working hours and updates daily attendance record.'
      }
    ],
    statutoryOrSecurityRules: [
      'Overtime calculation follows Factories Act and Shops & Commercial Establishments Act thresholds.',
      'GPS coordinates are recorded strictly at punch timestamps to protect employee privacy.',
      'Attendance logs cannot be manually edited without audit trail justification and managerial sign-off.'
    ],
    keyApiEndpoints: [
      'POST /api/v1/attendance/punch (Payload: employeeId, timestamp, lat, lng)',
      'GET /api/v1/attendance/my-summary?month=MM&year=YYYY',
      'POST /api/v1/attendance/regularize (Request attendance correction)'
    ],
    bestPractices: [
      'Calibrate biometric terminal timestamps with NTP network servers daily.',
      'Regularize missed punches before the monthly payroll cutoff date to prevent salary deductions.'
    ]
  },
  {
    id: 'continuous-payroll',
    number: '05',
    title: 'Continuous Calculation Engine (CCE) & Statutory Indian Payroll',
    shortName: 'Continuous Payroll',
    tagline: 'Real-time gross-to-net computation with EPF, ESI, PT, and Section 115BAC TDS',
    category: 'Finance',
    icon: CircleDollarSign,
    color: 'from-purple-600 to-pink-600',
    bgLight: 'bg-purple-50 text-purple-700',
    borderColor: 'border-purple-200',
    overview:
      'Unlike legacy batch systems that calculate payroll only once at month-end, the Priyex Continuous Calculation Engine (CCE) computes earnings, deductions, and tax liabilities continuously with every shift punch. It features full Indian statutory compliance for EPF, ESI, Professional Tax, and dual Income Tax regimes.',
    architecturePoints: [
      'Continuous Re-Computation: Zero calculation latency across employee shifts; salary figures update instantaneously as attendance occurs.',
      'Dual Tax Regime Engine: Evaluates tax liability under both the New Tax Regime (Section 115BAC revised slabs) and the Old Tax Regime.',
      'Statutory Deductions Engine: Automated calculation of Employee Provident Fund (12%), Employee State Insurance (0.75%), and state PT slabs.',
      'Banking Disbursement Output: Instant generation of bank-ready NEFT/RTGS batch upload files and automated PDF Form 16 payslips.'
    ],
    operationalSteps: [
      {
        step: 'Salary Structure Configuration',
        actor: 'HR Compensation Specialist',
        description: 'Assigns Cost-to-Company (CTC) breakdown: Basic (50%), HRA (25%), Special Allowance, and variable bonuses.',
        systemAction: 'Applies statutory wage ceilings for EPF (₹15,000 threshold) and ESI eligibility (₹21,000 ceiling).'
      },
      {
        step: 'Tax Regime Election & Declarations',
        actor: 'Employee',
        description: 'Selects preferred tax regime and submits Section 80C, 80D, and HRA rent receipts for tax exemption.',
        systemAction: 'Computes monthly TDS withholding based on declared investments and standard deduction (₹75,000 under New Regime).'
      },
      {
        step: 'Monthly Payroll Finalization',
        actor: 'Finance & HR Leadership',
        description: 'Reviews variance analysis, locks attendance cutoff, and clicks "Process & Disburse".',
        systemAction: 'Freezes salary registers, generates encrypted PDF payslips, and outputs EPFO ECR text format.'
      }
    ],
    statutoryOrSecurityRules: [
      'EPFO Contribution: 12% employee contribution matched by 12% employer contribution (split 8.33% EPS + 3.67% EPF).',
      'ESIC Contribution: 0.75% employee + 3.25% employer applicable on gross wages up to ₹21,000 per month.',
      'Professional Tax: Automatically mapped to employee work location state schedules (e.g. Maharashtra ₹200/month, ₹300 in Feb).',
      'Income Tax TDS: Compliant with CBDT circulars for financial year tax deductions.'
    ],
    keyApiEndpoints: [
      'POST /api/v1/payroll/process-cycle?month=MM&year=YYYY',
      'GET /api/v1/payroll/variance-check',
      'GET /api/v1/payroll/payslip/{employeeId}/{month}-{year}',
      'GET /api/v1/payroll/ecr-export'
    ],
    bestPractices: [
      'Collect and audit Chapter VI-A investment proofs in January/February before the final fiscal cycle.',
      'Reconcile biometric attendance exceptions 48 hours prior to locking the payroll batch.'
    ]
  },
  {
    id: 'leave-management',
    number: '06',
    title: 'Leave Policies, Approvals & Carry-Forward Engine',
    shortName: 'Leave Management',
    tagline: 'Multi-category leave balances with configurable approval escalations and encashment',
    category: 'Operations',
    icon: Palmtree,
    color: 'from-teal-600 to-emerald-600',
    bgLight: 'bg-teal-50 text-teal-700',
    borderColor: 'border-teal-200',
    overview:
      'Manage complex organizational leave policies across multiple employee bands and locations. Priyex supports dynamic leave accrual schedules, sandwich weekend rules, multi-tier manager approvals, and automated year-end carry-forward / encashment cycles.',
    architecturePoints: [
      'Configurable Leave Categories: Casual Leave (CL), Sick Leave (SL), Privilege Leave (PL/EL), Maternity Leave, and Compensatory Off.',
      'Flexible Accrual Engine: Supports monthly prorated grants, quarterly allocations, or upfront annual balance assignments.',
      'Sandwich Leave Rule: Configurable rule that counts intervening weekends or public holidays as leave days.',
      'Multi-Level Routing: Tiered approval chains (Employee -> Reporting Manager -> Department Head -> HR Ops).'
    ],
    operationalSteps: [
      {
        step: 'Leave Application',
        actor: 'Employee',
        description: 'Submits leave request with date range, leave type, and designated covering colleague.',
        systemAction: 'Checks available balance in real time; warns if request exceeds available balance or collides with blackout periods.'
      },
      {
        step: 'Managerial Review',
        actor: 'Reporting Manager',
        description: 'Manager receives email alert and reviews team leave calendar on their dashboard.',
        systemAction: 'Approve or reject with mandatory comments. Updates pending leave balance accordingly.'
      },
      {
        step: 'Year-End Carry Forward',
        actor: 'Automated Leave Cron',
        description: 'Evaluates unutilized leave balances at the close of the calendar/financial year.',
        systemAction: 'Carries forward allowable quotas (e.g. up to 15 days PL), encashes designated balances, and lapses excess days.'
      }
    ],
    statutoryOrSecurityRules: [
      'Maternity benefit complies with Maternity Benefit Amendment Act (26 weeks paid leave for eligible female staff).',
      'Encashment calculations reflect basic salary components in adherence to company service rules.',
      'Leave transactions remain immutable in audit logs to ensure transparent labor compliance.'
    ],
    keyApiEndpoints: [
      'GET /api/v1/leaves/balances',
      'POST /api/v1/leaves/apply (Payload: leaveTypeId, fromDate, toDate, reason)',
      'PUT /api/v1/leaves/{id}/approve',
      'PUT /api/v1/leaves/{id}/reject'
    ],
    bestPractices: [
      'Encourage employees to utilize privilege leaves throughout the year to avoid year-end project crunches.',
      'Set up clear delegation of approval authority when managers take extended personal leaves.'
    ]
  },
  {
    id: 'performance-okrs',
    number: '07',
    title: 'Performance Appraisals, OKRs & 360° Review Engine',
    shortName: 'Performance & OKRs',
    tagline: 'Objective key results tracking, continuous feedback, and bell-curve normalization',
    category: 'Operations',
    icon: Award,
    color: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50 text-amber-700',
    borderColor: 'border-amber-200',
    overview:
      'Transform traditional annual appraisals into continuous performance acceleration. Priyex aligns organizational objectives with individual Key Performance Indicators (KPIs), enabling self-assessments, multi-rater 360° reviews, and committee bell-curve normalization.',
    architecturePoints: [
      'Cascading OKRs: Strategic goals defined at the executive level cascade down to departments and individual team members.',
      'Weighted Metric Evaluation: Qualitative goals and quantitative numeric targets scored with customized percentage weights.',
      'Normalization Committee: HR leadership tools to review score distributions against standard bell curves (e.g. 10-70-20 rule).',
      'Direct Payroll Compensation Sync: Approved appraisal ratings seamlessly populate salary revision worksheets and incentive payouts.'
    ],
    operationalSteps: [
      {
        step: 'Goal Setting',
        actor: 'Employee & Manager',
        description: 'Define 3 to 5 key objectives with measurable milestones and target completion dates at the start of the quarter/year.',
        systemAction: 'Locks agreed OKR framework and tracks milestone updates.'
      },
      {
        step: 'Self & Peer Assessment',
        actor: 'Employee & Designated Peers',
        description: 'Employee fills self-rating and summary of accomplishments. Selected cross-functional peers provide 360 feedback.',
        systemAction: 'Aggregates feedback into an encrypted evaluation dossier accessible only to the primary manager.'
      },
      {
        step: 'Appraisal Finalization',
        actor: 'Manager & Normalization Panel',
        description: 'Manager assigns performance score (1 to 5 scale). Normalization panel reviews overall departmental distribution.',
        systemAction: 'Publishes appraisal scorecard, generates promotion letters, and updates compensation parameters.'
      }
    ],
    statutoryOrSecurityRules: [
      'Appraisal ratings and manager review comments are confidential and restricted by role-based access control.',
      'Appraisal audit trails retain historic scores across multiple years for longitudinal career progression analysis.'
    ],
    keyApiEndpoints: [
      'GET /api/v1/performance/my-goals',
      'POST /api/v1/performance/goals',
      'POST /api/v1/performance/appraisals/submit-review',
      'GET /api/v1/performance/normalization-curve'
    ],
    bestPractices: [
      'Conduct monthly 1-on-1 check-ins to calibrate progress rather than waiting for annual review cycles.',
      'Maintain concrete milestone deliverables to ensure objective rating discussions.'
    ]
  },
  {
    id: 'resignation-settlement',
    number: '08',
    title: 'Separation, Resignation & Full & Final (F&F) Settlement',
    shortName: 'Separation & F&F',
    tagline: 'Standardized exit interviews, cross-departmental clearances, and automated F&F calculations',
    category: 'Operations',
    icon: LogOut,
    color: 'from-rose-600 to-red-600',
    bgLight: 'bg-rose-50 text-rose-700',
    borderColor: 'border-rose-200',
    overview:
      'Manage employee departures with dignity, governance, and precision. Priyex automates resignation requests, notice period calculations, multi-departmental asset clearances (IT, Finance, Admin), gratuity computations, and final relieving documentation.',
    architecturePoints: [
      'Notice Period Calculator: Dynamic computation of notice duration based on employment contract, tracking shortfall days and buyout costs.',
      'Digital NOC Matrix: Cross-departmental clearance workflows for IT hardware return, finance expense claims, and building access revoke.',
      'Statutory Gratuity Engine: Calculates gratuity entitlement under the Payment of Gratuity Act 1972 (15 days salary per year of service for tenure >= 5 years).',
      'Automated Documentation: Generates digitally signed Experience Letters, Relieving Certificates, and F&F Settlement Sheets.'
    ],
    operationalSteps: [
      {
        step: 'Resignation Submission',
        actor: 'Employee',
        description: 'Employee submits formal resignation letter via the portal with proposed Last Working Day (LWD).',
        systemAction: 'Notifies reporting manager and HR leadership; calculates contractual notice requirement.'
      },
      {
        step: 'Departmental Clearance (NOC)',
        actor: 'IT, Finance & Admin Ops',
        description: 'IT confirms laptop recovery, Finance settles travel advances, and Facilities disables RFID access.',
        systemAction: 'Updates clearance checklist. System prevents F&F disbursement until 100% of clearances are signed off.'
      },
      {
        step: 'F&F Payout & Document Release',
        actor: 'Payroll & HR Ops',
        description: 'Generates comprehensive settlement statement: unpaid salary + leave encashment + gratuity - notice buyout.',
        systemAction: 'Disburses settlement through banking channel, marks status EXITED, and issues relieving documents.'
      }
    ],
    statutoryOrSecurityRules: [
      'Gratuity formula: (15 * Last Drawn Basic * Completed Years of Service) / 26.',
      'Full and Final settlements must be cleared within statutory prescribed timelines following the last working day.',
      'Ex-employee login credentials automatically converted to alumni view (accessing past payslips and Form 16s only).'
    ],
    keyApiEndpoints: [
      'POST /api/v1/separation/resign',
      'GET /api/v1/separation/clearance-status/{employeeId}',
      'POST /api/v1/separation/calculate-fnf/{employeeId}',
      'GET /api/v1/separation/relieving-letter/{employeeId}'
    ],
    bestPractices: [
      'Conduct a structured exit interview to capture constructive organizational feedback.',
      'Complete all IT asset verifications 24 hours prior to the employee final sign-off.'
    ]
  },
  {
    id: 'rbac-governance',
    number: '09',
    title: 'Role-Based Access Control (RBAC) & Enterprise Governance',
    shortName: 'RBAC & Governance',
    tagline: 'Granular least-privilege role matrix, immutable audit logging, and compliance readiness',
    category: 'Governance',
    icon: ShieldCheck,
    color: 'from-slate-700 to-indigo-900',
    bgLight: 'bg-slate-100 text-slate-800',
    borderColor: 'border-slate-300',
    overview:
      'Priyex enforces a strict principle-of-least-privilege security model through an enterprise Role-Based Access Control (RBAC) engine. Five distinct authorization levels partition capabilities across platform administration, tenant management, HR operations, team supervision, and employee self-service.',
    architecturePoints: [
      'Five Standard Authorization Tiers: SUPER_ADMIN (Platform Infrastructure), ADMIN (Tenant Executive), HR_ADMIN (People Ops), MANAGER (Team Lead), EMPLOYEE (Self-Service).',
      'Method-Level Security: Spring Security annotations (@PreAuthorize) enforce role boundaries on every REST endpoint and service invocation.',
      'Immutable Audit Logging: High-fidelity audit records capturing actor ID, timestamp, IP address, target entity, and before/after state diffs.',
      'Zero-Trust Data Protection: Sensitive compensation and identity records accessible exclusively on a need-to-know basis.'
    ],
    operationalSteps: [
      {
        step: 'User Role Assignment',
        actor: 'Tenant Administrator',
        description: 'Assigns operational roles to corporate staff in alignment with their organizational job responsibilities.',
        systemAction: 'Updates role claims and invalidates active tokens to force refresh of new privileges.'
      },
      {
        step: 'Privilege Verification',
        actor: 'API Gateway & Controllers',
        description: 'Incoming requests evaluated against endpoint permission declarations.',
        systemAction: 'Allows authorized requests or rejects unauthorized access attempts with HTTP 403 Forbidden.'
      },
      {
        step: 'Compliance Audit Review',
        actor: 'Internal / External Auditors',
        description: 'Auditors inspect chronological transaction logs for policy change events, salary updates, and profile edits.',
        systemAction: 'Generates non-repudiable audit export reports formatted for compliance submissions.'
      }
    ],
    statutoryOrSecurityRules: [
      'Administrative actions require individual named accounts; generic shared accounts are strictly prohibited.',
      'Audit log entries are append-only and cannot be altered, redacted, or deleted by any operational role.',
      'Meets compliance standards for SOC 2 Type II, ISO/IEC 27001, and General Data Protection Regulations (GDPR).'
    ],
    keyApiEndpoints: [
      'GET /api/v1/roles/matrix',
      'PUT /api/v1/users/{id}/role (Assign role)',
      'GET /api/v1/audit/logs (Audit event stream)'
    ],
    bestPractices: [
      'Conduct quarterly access reviews to de-provision or downgrade accounts for departed or transferred staff.',
      'Enforce multi-factor authentication (MFA) across all administrative role tiers.'
    ]
  }
];

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({
  isOpen,
  onClose,
  initialFlowId
}) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(initialFlowId || 'multitenant');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'architecture' | 'statutory' | 'api'>('overview');

  // Sync initial flow if prop changes
  React.useEffect(() => {
    if (initialFlowId) {
      setSelectedFlowId(initialFlowId);
    }
  }, [initialFlowId]);

  // Filter workflows by search query
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) return PLATFORM_WORKFLOWS;
    const q = searchQuery.toLowerCase();
    return PLATFORM_WORKFLOWS.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.shortName.toLowerCase().includes(q) ||
        w.tagline.toLowerCase().includes(q) ||
        w.overview.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentFlow = useMemo(() => {
    return (
      PLATFORM_WORKFLOWS.find((w) => w.id === selectedFlowId) ||
      PLATFORM_WORKFLOWS[0]
    );
  }, [selectedFlowId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPrintableDoc = () => {
    window.open('/docs/priyex-platform-guide.html', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Priyex Platform Operational Manual & Architecture Guide
                </h2>
                <span className="hidden sm:inline-flex bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Specification
                </span>
              </div>
              <p className="text-xs text-slate-300">
                End-to-end documentation across 9 operational enterprise flows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Open Standalone Printable HTML/PDF */}
            <button
              onClick={handleOpenPrintableDoc}
              title="Open Standalone Printable Document in New Tab"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-700 text-indigo-100 border border-indigo-600/40 text-xs font-semibold transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full View / Tab</span>
            </button>

            {/* Print / Save to PDF Button */}
            <button
              onClick={handlePrint}
              title="Print or Save as PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar + Detail View */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Column: Flow Navigation & Search */}
          <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
            
            {/* Search Box */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search workflows, modules, laws..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Workflows List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredWorkflows.map((flow) => {
                const IconComponent = flow.icon;
                const isSelected = flow.id === currentFlow.id;
                return (
                  <button
                    key={flow.id}
                    onClick={() => {
                      setSelectedFlowId(flow.id);
                      setActiveTab('overview');
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white shadow-sm border border-indigo-200 ring-2 ring-indigo-500/10'
                        : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-tr ' + flow.color + ' text-white shadow-sm'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Flow {flow.number}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                          {flow.category}
                        </span>
                      </div>
                      <h4
                        className={`text-xs font-bold truncate mt-0.5 ${
                          isSelected ? 'text-indigo-900' : 'text-slate-800'
                        }`}
                      >
                        {flow.shortName}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {flow.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredWorkflows.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No workflows matched your search term "{searchQuery}".
                </div>
              )}
            </div>

            {/* Quick Helper Footer */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>9 Enterprise Modules</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Spec
              </span>
            </div>
          </div>

          {/* Right Column: Detailed Active Flow Document */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Flow Title Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${currentFlow.color} text-white flex items-center justify-center shadow-md shadow-indigo-600/10 shrink-0`}
                  >
                    <currentFlow.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Workflow #{currentFlow.number}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Category: {currentFlow.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                      {currentFlow.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 italic hidden sm:inline">
                    {currentFlow.tagline}
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs font-semibold">
                {[
                  { key: 'overview', label: '1. Architecture & Overview' },
                  { key: 'steps', label: '2. Operational Sequence' },
                  { key: 'statutory', label: '3. Compliance & Security' },
                  { key: 'api', label: '4. REST APIs & Contracts' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content Pane */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-700">
              
              {/* TAB 1: OVERVIEW & ARCHITECTURE */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Functional Overview
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      {currentFlow.overview}
                    </p>
                  </div>

                  {/* Architectural Pillars */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Core Architectural Pillars
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentFlow.architecturePoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-700">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Implementation Recommendations & Best Practices
                    </h4>
                    <div className="space-y-2">
                      {currentFlow.bestPractices.map((bp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OPERATIONAL SEQUENCE STEPS */}
              {activeTab === 'steps' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Step-by-Step Execution Journey
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Follow the sequential interaction lifecycle between users, administrators, and the automated Priyex engine.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {currentFlow.operationalSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs relative pl-12"
                      >
                        {/* Step Marker */}
                        <div className="absolute left-4 top-4 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <h5 className="text-sm font-bold text-slate-900">
                            {step.step}
                          </h5>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Actor: {step.actor}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-3">
                          {step.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700">
                            <strong>Platform Action:</strong> {step.systemAction}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STATUTORY RULES & SECURITY */}
              {activeTab === 'statutory' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Regulatory Compliance & Security Perimeters
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Built-in legal statutory logic, labor law adherence, and zero-trust perimeter enforcement rules.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentFlow.statutoryOrSecurityRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-950 leading-relaxed">
                            {rule}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <Lock className="w-4 h-4" />
                      <span>Security & Non-Disclosure Notice</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Priyex maintains cryptographic separation of tenant spaces. No confidential administrative credentials, user secrets, or database master strings are exposed through client-facing views. All operations comply with SOC 2 Type II controls.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: API CONTRACTS */}
              {activeTab === 'api' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      REST API Contracts & Gateway Handlers
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Core backend API endpoints responsible for orchestrating this operational workflow.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentFlow.keyApiEndpoints.map((ep, idx) => {
                      const [method, ...path] = ep.split(' ');
                      const fullPath = path.join(' ');
                      return (
                        <div
                          key={idx}
                          className="font-mono text-xs p-3 rounded-xl bg-slate-950 text-slate-200 flex items-center justify-between border border-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                method === 'GET'
                                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                                  : method === 'POST'
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                                  : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {method}
                            </span>
                            <span className="text-slate-300 text-xs font-medium">
                              {fullPath}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 hidden sm:inline">
                            Bearer JWT Required
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
                    <p>
                      <strong>Integration Note:</strong> All API requests must provide the signed Authorization header (<code>Bearer &lt;token&gt;</code>). The gateway automatically derives the tenant context without manual tenant ID parameter manipulation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentIndex = PLATFORM_WORKFLOWS.findIndex((w) => w.id === currentFlow.id);
                    if (currentIndex > 0) {
                      setSelectedFlowId(PLATFORM_WORKFLOWS[currentIndex - 1].id);
                      setActiveTab('overview');
                    }
                  }}
                  disabled={PLATFORM_WORKFLOWS.findIndex((w) => w.id === currentFlow.id) === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  ← Previous Flow
                </button>
                <button
                  onClick={() => {
                    const currentIndex = PLATFORM_WORKFLOWS.findIndex((w) => w.id === currentFlow.id);
                    if (currentIndex < PLATFORM_WORKFLOWS.length - 1) {
                      setSelectedFlowId(PLATFORM_WORKFLOWS[currentIndex + 1].id);
                      setActiveTab('overview');
                    }
                  }}
                  disabled={PLATFORM_WORKFLOWS.findIndex((w) => w.id === currentFlow.id) === PLATFORM_WORKFLOWS.length - 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Next Flow →
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Done Reading
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
