// Global Geographic Reference Data for Enterprise SaaS HRMS
// Designed to be lightweight, comprehensive, and extensible with zero external bloat.

export interface CountryInfo {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  flag: string;
  phoneCode: string;
  postalLabel: string;
  postalPlaceholder: string;
  postalRegex?: string;
  postalRequired: boolean;
  aliases?: string[];
}

export interface StateInfo {
  name: string;
  code?: string;
  cities: string[];
}

// 1. Comprehensive list of countries worldwide with flags & postal rules
export const GLOBAL_COUNTRIES: CountryInfo[] = [
  // Primary Enterprise Business Hubs
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91', postalLabel: 'PIN Code', postalPlaceholder: '560103', postalRegex: '^\\d{6}$', postalRequired: true, aliases: ['in', 'bharat', 'ind'] },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1', postalLabel: 'ZIP Code', postalPlaceholder: '94105', postalRegex: '^\\d{5}(-\\d{4})?$', postalRequired: true, aliases: ['usa', 'us', 'u.s.a.', 'united states of america'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44', postalLabel: 'Postal Code', postalPlaceholder: 'SW1A 1AA', postalRegex: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', postalRequired: true, aliases: ['uk', 'great britain', 'england', 'britain'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1', postalLabel: 'Postal Code', postalPlaceholder: 'M5V 2T6', postalRegex: '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', postalRequired: true, aliases: ['can'] },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phoneCode: '+971', postalLabel: 'Postal / Makani Code', postalPlaceholder: 'Optional (e.g. Dubai)', postalRequired: false, aliases: ['uae', 'dubai', 'abu dhabi'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65', postalLabel: 'Postal Code', postalPlaceholder: '018956', postalRegex: '^\\d{6}$', postalRequired: true, aliases: ['sgp'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61', postalLabel: 'Postal Code', postalPlaceholder: '2000', postalRegex: '^\\d{4}$', postalRequired: true, aliases: ['aus'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49', postalLabel: 'Postal Code (PLZ)', postalPlaceholder: '10115', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['deu', 'deutschland'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33', postalLabel: 'Code Postal', postalPlaceholder: '75001', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['fra'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31', postalLabel: 'Postcode', postalPlaceholder: '1012 JS', postalRegex: '^\\d{4} ?[A-Z]{2}$', postalRequired: true, aliases: ['nld', 'holland'] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', phoneCode: '+353', postalLabel: 'Eircode', postalPlaceholder: 'D02 X285', postalRequired: false, aliases: ['irl'] },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phoneCode: '+41', postalLabel: 'PLZ', postalPlaceholder: '8001', postalRegex: '^\\d{4}$', postalRequired: true, aliases: ['che'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81', postalLabel: 'Postal Code', postalPlaceholder: '100-0001', postalRegex: '^\\d{3}-\\d{4}$', postalRequired: true, aliases: ['jpn'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phoneCode: '+966', postalLabel: 'Postal Code', postalPlaceholder: '12211', postalRegex: '^\\d{5}$', postalRequired: false, aliases: ['ksa', 'sau'] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', phoneCode: '+64', postalLabel: 'Postal Code', postalPlaceholder: '1010', postalRegex: '^\\d{4}$', postalRequired: true, aliases: ['nzl'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', phoneCode: '+63', postalLabel: 'ZIP Code', postalPlaceholder: '1200', postalRegex: '^\\d{4}$', postalRequired: true, aliases: ['phl'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phoneCode: '+60', postalLabel: 'Postcode', postalPlaceholder: '50450', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['mys'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phoneCode: '+62', postalLabel: 'Postal Code', postalPlaceholder: '10110', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['idn'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phoneCode: '+84', postalLabel: 'Postal Code', postalPlaceholder: '100000', postalRegex: '^\\d{6}$', postalRequired: false, aliases: ['vnm'] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', phoneCode: '+48', postalLabel: 'Kod Pocztowy', postalPlaceholder: '00-001', postalRegex: '^\\d{2}-\\d{3}$', postalRequired: true, aliases: ['pol'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34', postalLabel: 'Código Postal', postalPlaceholder: '28001', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['esp'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39', postalLabel: 'CAP', postalPlaceholder: '00100', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['ita'] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phoneCode: '+46', postalLabel: 'Postnummer', postalPlaceholder: '111 22', postalRegex: '^\\d{3} ?\\d{2}$', postalRequired: true, aliases: ['swe'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phoneCode: '+27', postalLabel: 'Postal Code', postalPlaceholder: '2000', postalRegex: '^\\d{4}$', postalRequired: true, aliases: ['zaf'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55', postalLabel: 'CEP', postalPlaceholder: '01001-000', postalRegex: '^\\d{5}-?\\d{3}$', postalRequired: true, aliases: ['bra'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phoneCode: '+52', postalLabel: 'Código Postal', postalPlaceholder: '06000', postalRegex: '^\\d{5}$', postalRequired: true, aliases: ['mex'] },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', phoneCode: '+972', postalLabel: 'Postal Code', postalPlaceholder: '6100000', postalRegex: '^\\d{7}$', postalRequired: false, aliases: ['isr'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', phoneCode: '+974', postalLabel: 'Zone / Postal Code', postalPlaceholder: 'Optional (e.g. Doha)', postalRequired: false, aliases: ['qat'] },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', phoneCode: '+965', postalLabel: 'Postal Code', postalPlaceholder: '13001', postalRequired: false, aliases: ['kwt'] },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', phoneCode: '+968', postalLabel: 'Postal Code', postalPlaceholder: '111', postalRequired: false, aliases: ['omn'] },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', phoneCode: '+973', postalLabel: 'Postal Code', postalPlaceholder: '317', postalRequired: false, aliases: ['bhr'] },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', phoneCode: '+20', postalLabel: 'Postal Code', postalPlaceholder: '11511', postalRequired: false, aliases: ['egy'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phoneCode: '+234', postalLabel: 'Postal Code', postalPlaceholder: '100001', postalRequired: false, aliases: ['nga'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', phoneCode: '+254', postalLabel: 'Postal Code', postalPlaceholder: '00100', postalRequired: false, aliases: ['ken'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82', postalLabel: 'Postal Code', postalPlaceholder: '03000', postalRequired: true, aliases: ['kor', 'korea'] },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', phoneCode: '+852', postalLabel: 'Postal Code', postalPlaceholder: 'Leave blank', postalRequired: false, aliases: ['hkg'] },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', phoneCode: '+886', postalLabel: 'Postal Code', postalPlaceholder: '100', postalRequired: true, aliases: ['twn'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phoneCode: '+66', postalLabel: 'Postal Code', postalPlaceholder: '10100', postalRequired: true, aliases: ['tha'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', phoneCode: '+90', postalLabel: 'Postal Code', postalPlaceholder: '34000', postalRequired: true, aliases: ['tur', 'turkiye'] },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', phoneCode: '+43', postalLabel: 'PLZ', postalPlaceholder: '1010', postalRequired: true, aliases: ['aut'] },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phoneCode: '+32', postalLabel: 'Postal Code', postalPlaceholder: '1000', postalRequired: true, aliases: ['bel'] },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phoneCode: '+45', postalLabel: 'Postnummer', postalPlaceholder: '1050', postalRequired: true, aliases: ['dnk'] },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', phoneCode: '+358', postalLabel: 'Postinumero', postalPlaceholder: '00100', postalRequired: true, aliases: ['fin'] },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', phoneCode: '+47', postalLabel: 'Postnummer', postalPlaceholder: '0001', postalRequired: true, aliases: ['nor'] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', phoneCode: '+351', postalLabel: 'Código Postal', postalPlaceholder: '1000-001', postalRequired: true, aliases: ['prt'] },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', phoneCode: '+30', postalLabel: 'Postal Code', postalPlaceholder: '104 31', postalRequired: true, aliases: ['grc'] },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', phoneCode: '+420', postalLabel: 'PSČ', postalPlaceholder: '110 00', postalRequired: true, aliases: ['cze', 'czechia'] },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', phoneCode: '+36', postalLabel: 'Irányítószám', postalPlaceholder: '1011', postalRequired: true, aliases: ['hun'] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', phoneCode: '+40', postalLabel: 'Postal Code', postalPlaceholder: '010011', postalRequired: true, aliases: ['rou'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phoneCode: '+54', postalLabel: 'Código Postal', postalPlaceholder: 'C1002', postalRequired: true, aliases: ['arg'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', phoneCode: '+56', postalLabel: 'Código Postal', postalPlaceholder: '8320000', postalRequired: true, aliases: ['chl'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', phoneCode: '+57', postalLabel: 'Código Postal', postalPlaceholder: '110111', postalRequired: true, aliases: ['col'] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', phoneCode: '+51', postalLabel: 'Código Postal', postalPlaceholder: '15001', postalRequired: false, aliases: ['per'] },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', phoneCode: '+94', postalLabel: 'Postal Code', postalPlaceholder: '00100', postalRequired: false, aliases: ['lka'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', phoneCode: '+880', postalLabel: 'Postal Code', postalPlaceholder: '1000', postalRequired: false, aliases: ['bgd'] },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', phoneCode: '+977', postalLabel: 'Postal Code', postalPlaceholder: '44600', postalRequired: false, aliases: ['npl'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', phoneCode: '+92', postalLabel: 'Postal Code', postalPlaceholder: '44000', postalRequired: false, aliases: ['pak'] },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', phoneCode: '+230', postalLabel: 'Postal Code', postalPlaceholder: '742CU001', postalRequired: false, aliases: ['mus'] },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', phoneCode: '+352', postalLabel: 'Code Postal', postalPlaceholder: '1009', postalRequired: true, aliases: ['lux'] },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', phoneCode: '+354', postalLabel: 'Póstnúmer', postalPlaceholder: '101', postalRequired: true, aliases: ['isl'] },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', phoneCode: '+357', postalLabel: 'Postal Code', postalPlaceholder: '1010', postalRequired: true, aliases: ['cyp'] },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', phoneCode: '+356', postalLabel: 'Postcode', postalPlaceholder: 'VLT 1115', postalRequired: true, aliases: ['mlt'] },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', phoneCode: '+372', postalLabel: 'Postiindeks', postalPlaceholder: '10115', postalRequired: true, aliases: ['est'] },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', phoneCode: '+371', postalLabel: 'Pasta Indekss', postalPlaceholder: 'LV-1050', postalRequired: true, aliases: ['lva'] },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', phoneCode: '+370', postalLabel: 'Pašto Kodas', postalPlaceholder: 'LT-01100', postalRequired: true, aliases: ['ltu'] },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', phoneCode: '+421', postalLabel: 'PSČ', postalPlaceholder: '811 01', postalRequired: true, aliases: ['svk'] },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', phoneCode: '+386', postalLabel: 'Poštna Številka', postalPlaceholder: '1000', postalRequired: true, aliases: ['svn'] },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', phoneCode: '+385', postalLabel: 'Poštanski Broj', postalPlaceholder: '10000', postalRequired: true, aliases: ['hrv'] },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', phoneCode: '+359', postalLabel: 'Пощенски Код', postalPlaceholder: '1000', postalRequired: true, aliases: ['bgr'] },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', phoneCode: '+381', postalLabel: 'Poštanski Broj', postalPlaceholder: '11000', postalRequired: true, aliases: ['srb'] },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', phoneCode: '+380', postalLabel: 'Поштовий Індекс', postalPlaceholder: '01001', postalRequired: true, aliases: ['ukr'] },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', phoneCode: '+962', postalLabel: 'Postal Code', postalPlaceholder: '11118', postalRequired: false, aliases: ['jor'] },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', phoneCode: '+961', postalLabel: 'Postal Code', postalPlaceholder: '1107 2020', postalRequired: false, aliases: ['lbn'] },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', phoneCode: '+212', postalLabel: 'Code Postal', postalPlaceholder: '10000', postalRequired: false, aliases: ['mar'] },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', phoneCode: '+216', postalLabel: 'Code Postal', postalPlaceholder: '1000', postalRequired: false, aliases: ['tun'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', phoneCode: '+233', postalLabel: 'Postal Code', postalPlaceholder: 'GA-183-9302', postalRequired: false, aliases: ['gha'] },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', phoneCode: '+256', postalLabel: 'Postal Code', postalPlaceholder: 'Leave blank', postalRequired: false, aliases: ['uga'] },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', phoneCode: '+250', postalLabel: 'Postal Code', postalPlaceholder: 'Leave blank', postalRequired: false, aliases: ['rwa'] },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', phoneCode: '+506', postalLabel: 'Código Postal', postalPlaceholder: '10101', postalRequired: true, aliases: ['cri'] },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', phoneCode: '+507', postalLabel: 'Postal Code', postalPlaceholder: 'Leave blank', postalRequired: false, aliases: ['pan'] },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', phoneCode: '+598', postalLabel: 'Código Postal', postalPlaceholder: '11100', postalRequired: true, aliases: ['ury'] },
];

// 2. Curated State & City Cascading Dictionary
export const GLOBAL_STATES_CITIES: Record<string, StateInfo[]> = {
  // INDIA
  IN: [
    {
      name: 'Uttar Pradesh',
      code: 'UP',
      cities: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur']
    },
    {
      name: 'Karnataka',
      code: 'KA',
      cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi']
    },
    {
      name: 'Maharashtra',
      code: 'MH',
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati']
    },
    {
      name: 'Delhi',
      code: 'DL',
      cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Connaught Place']
    },
    {
      name: 'Haryana',
      code: 'HR',
      cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Panchkula']
    },
    {
      name: 'Tamil Nadu',
      code: 'TN',
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore']
    },
    {
      name: 'Telangana',
      code: 'TG',
      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Secunderabad', 'Ramagundam']
    },
    {
      name: 'Gujarat',
      code: 'GJ',
      cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand']
    },
    {
      name: 'West Bengal',
      code: 'WB',
      cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman']
    },
    {
      name: 'Rajasthan',
      code: 'RJ',
      cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar']
    },
    {
      name: 'Kerala',
      code: 'KL',
      cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha']
    },
    {
      name: 'Madhya Pradesh',
      code: 'MP',
      cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna']
    },
    {
      name: 'Punjab',
      code: 'PB',
      cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur']
    },
    {
      name: 'Chandigarh',
      code: 'CH',
      cities: ['Chandigarh']
    },
    {
      name: 'Andhra Pradesh',
      code: 'AP',
      cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry']
    },
    {
      name: 'Bihar',
      code: 'BR',
      cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif']
    },
    {
      name: 'Odisha',
      code: 'OD',
      cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri']
    },
    {
      name: 'Assam',
      code: 'AS',
      cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia']
    },
    {
      name: 'Jharkhand',
      code: 'JH',
      cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh']
    },
    {
      name: 'Chhattisgarh',
      code: 'CG',
      cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon']
    },
    {
      name: 'Uttarakhand',
      code: 'UK',
      cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Rudrapur']
    },
    {
      name: 'Goa',
      code: 'GA',
      cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda']
    },
    {
      name: 'Himachal Pradesh',
      code: 'HP',
      cities: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali']
    },
    {
      name: 'Jammu and Kashmir',
      code: 'JK',
      cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur']
    },
    {
      name: 'Ladakh',
      code: 'LA',
      cities: ['Leh', 'Kargil']
    },
    {
      name: 'Puducherry',
      code: 'PY',
      cities: ['Puducherry', 'Karaikal', 'Oulgaret']
    },
    {
      name: 'Tripura',
      code: 'TR',
      cities: ['Agartala', 'Dharmanagar', 'Udaipur']
    },
    {
      name: 'Meghalaya',
      code: 'ML',
      cities: ['Shillong', 'Tura', 'Jowai']
    },
    {
      name: 'Manipur',
      code: 'MN',
      cities: ['Imphal', 'Thoubal']
    },
    {
      name: 'Nagaland',
      code: 'NL',
      cities: ['Kohima', 'Dimapur']
    },
    {
      name: 'Mizoram',
      code: 'MZ',
      cities: ['Aizawl', 'Lunglei']
    },
    {
      name: 'Arunachal Pradesh',
      code: 'AR',
      cities: ['Itanagar', 'Naharlagun', 'Pasighat']
    },
    {
      name: 'Sikkim',
      code: 'SK',
      cities: ['Gangtok', 'Namchi']
    }
  ],

  // UNITED STATES
  US: [
    {
      name: 'California',
      code: 'CA',
      cities: ['San Francisco', 'San Jose', 'Los Angeles', 'San Diego', 'Palo Alto', 'Mountain View', 'Sunnyvale', 'Oakland', 'Sacramento', 'Irvine']
    },
    {
      name: 'New York',
      code: 'NY',
      cities: ['New York City', 'Brooklyn', 'Manhattan', 'Queens', 'Albany', 'Buffalo', 'Rochester', 'Syracuse', 'White Plains']
    },
    {
      name: 'Texas',
      code: 'TX',
      cities: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'Plano', 'Irving', 'Frisco', 'Arlington']
    },
    {
      name: 'Washington',
      code: 'WA',
      cities: ['Seattle', 'Bellevue', 'Redmond', 'Kirkland', 'Tacoma', 'Spokane', 'Vancouver', 'Olympia']
    },
    {
      name: 'Massachusetts',
      code: 'MA',
      cities: ['Boston', 'Cambridge', 'Somerville', 'Worcester', 'Waltham', 'Burlington', 'Newton']
    },
    {
      name: 'Illinois',
      code: 'IL',
      cities: ['Chicago', 'Naperville', 'Evanston', 'Schaumburg', 'Peoria', 'Rockford', 'Springfield']
    },
    {
      name: 'Florida',
      code: 'FL',
      cities: ['Miami', 'Orlando', 'Tampa', 'Fort Lauderdale', 'Jacksonville', 'St. Petersburg', 'Boca Raton']
    },
    {
      name: 'New Jersey',
      code: 'NJ',
      cities: ['Jersey City', 'Newark', 'Princeton', 'Hoboken', 'Edison', 'Bridgewater', 'Morristown']
    },
    {
      name: 'Georgia',
      code: 'GA',
      cities: ['Atlanta', 'Alpharetta', 'Savannah', 'Augusta', 'Roswell', 'Sandy Springs']
    },
    {
      name: 'North Carolina',
      code: 'NC',
      cities: ['Charlotte', 'Raleigh', 'Durham', 'Cary', 'Greensboro', 'Winston-Salem']
    },
    {
      name: 'Virginia',
      code: 'VA',
      cities: ['Arlington', 'McLean', 'Richmond', 'Alexandria', 'Reston', 'Tysons', 'Virginia Beach']
    },
    {
      name: 'Colorado',
      code: 'CO',
      cities: ['Denver', 'Boulder', 'Colorado Springs', 'Fort Collins', 'Aurora', 'Lakewood']
    },
    {
      name: 'Arizona',
      code: 'AZ',
      cities: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Tucson']
    },
    {
      name: 'Pennsylvania',
      code: 'PA',
      cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'King of Prussia', 'Erie', 'Harrisburg']
    },
    {
      name: 'Ohio',
      code: 'OH',
      cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton']
    },
    {
      name: 'Michigan',
      code: 'MI',
      cities: ['Detroit', 'Ann Arbor', 'Grand Rapids', 'Troy', 'Lansing']
    },
    {
      name: 'District of Columbia',
      code: 'DC',
      cities: ['Washington']
    }
  ],

  // UNITED KINGDOM
  GB: [
    {
      name: 'Greater London',
      code: 'LND',
      cities: ['London', 'City of London', 'Westminster', 'Camden', 'Greenwich', 'Canary Wharf', 'Croydon']
    },
    {
      name: 'England - South East',
      code: 'SE',
      cities: ['Reading', 'Oxford', 'Brighton', 'Southampton', 'Portsmouth', 'Milton Keynes', 'Slough']
    },
    {
      name: 'England - West Midlands',
      code: 'WM',
      cities: ['Birmingham', 'Coventry', 'Wolverhampton', 'Solihull']
    },
    {
      name: 'England - North West',
      code: 'NW',
      cities: ['Manchester', 'Liverpool', 'Salford', 'Bolton', 'Chester']
    },
    {
      name: 'England - Yorkshire',
      code: 'YH',
      cities: ['Leeds', 'Sheffield', 'York', 'Bradford', 'Hull']
    },
    {
      name: 'Scotland',
      code: 'SCT',
      cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness']
    },
    {
      name: 'Wales',
      code: 'WLS',
      cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham']
    },
    {
      name: 'Northern Ireland',
      code: 'NIR',
      cities: ['Belfast', 'Derry', 'Lisburn', 'Newry']
    }
  ],

  // UNITED ARAB EMIRATES
  AE: [
    {
      name: 'Dubai',
      code: 'DXB',
      cities: ['Dubai', 'Downtown Dubai', 'Business Bay', 'Dubai Marina', 'DIFC', 'JLT', 'Deira', 'Bur Dubai']
    },
    {
      name: 'Abu Dhabi',
      code: 'AUH',
      cities: ['Abu Dhabi', 'Al Ain', 'Al Dhafra', 'Yas Island', 'Saadiyat Island', 'Al Reem Island']
    },
    {
      name: 'Sharjah',
      code: 'SHJ',
      cities: ['Sharjah', 'Khor Fakkan', 'Kalba']
    },
    {
      name: 'Ajman',
      code: 'AJM',
      cities: ['Ajman']
    },
    {
      name: 'Ras Al Khaimah',
      code: 'RAK',
      cities: ['Ras Al Khaimah']
    },
    {
      name: 'Fujairah',
      code: 'FUJ',
      cities: ['Fujairah']
    },
    {
      name: 'Umm Al Quwain',
      code: 'UAQ',
      cities: ['Umm Al Quwain']
    }
  ],

  // SINGAPORE
  SG: [
    {
      name: 'Central Region',
      cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'River Valley', 'Tanjong Pagar', 'Bukit Merah', 'Queenstown']
    },
    {
      name: 'East Region',
      cities: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi']
    },
    {
      name: 'West Region',
      cities: ['Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok', 'Boon Lay']
    },
    {
      name: 'North Region',
      cities: ['Woodlands', 'Yishun', 'Sembawang']
    },
    {
      name: 'North-East Region',
      cities: ['Punggol', 'Sengkang', 'Hougang', 'Ang Mo Kio', 'Serangoon']
    }
  ],

  // CANADA
  CA: [
    {
      name: 'Ontario',
      code: 'ON',
      cities: ['Toronto', 'Ottawa', 'Mississauga', 'Waterloo', 'Kitchener', 'Markham', 'Brampton', 'Hamilton', 'London']
    },
    {
      name: 'British Columbia',
      code: 'BC',
      cities: ['Vancouver', 'Victoria', 'Burnaby', 'Richmond', 'Surrey', 'Kelowna', 'Coquitlam']
    },
    {
      name: 'Quebec',
      code: 'QC',
      cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke']
    },
    {
      name: 'Alberta',
      code: 'AB',
      cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge']
    }
  ],

  // AUSTRALIA
  AU: [
    {
      name: 'New South Wales',
      code: 'NSW',
      cities: ['Sydney', 'Newcastle', 'Wollongong', 'Parramatta', 'Central Coast']
    },
    {
      name: 'Victoria',
      code: 'VIC',
      cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo']
    },
    {
      name: 'Queensland',
      code: 'QLD',
      cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns', 'Townsville']
    },
    {
      name: 'Western Australia',
      code: 'WA',
      cities: ['Perth', 'Fremantle', 'Mandurah']
    }
  ],

  // GERMANY
  DE: [
    {
      name: 'Bavaria',
      code: 'BY',
      cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Erlangen']
    },
    {
      name: 'Berlin',
      code: 'BE',
      cities: ['Berlin']
    },
    {
      name: 'North Rhine-Westphalia',
      code: 'NW',
      cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn', 'Münster', 'Aachen']
    },
    {
      name: 'Hesse',
      code: 'HE',
      cities: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach']
    },
    {
      name: 'Baden-Württemberg',
      code: 'BW',
      cities: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Heidelberg', 'Freiburg', 'Ulm']
    },
    {
      name: 'Hamburg',
      code: 'HH',
      cities: ['Hamburg']
    }
  ],

  // NETHERLANDS
  NL: [
    {
      name: 'North Holland',
      code: 'NH',
      cities: ['Amsterdam', 'Haarlem', 'Hilversum', 'Zaandam', 'Amstelveen']
    },
    {
      name: 'South Holland',
      code: 'ZH',
      cities: ['Rotterdam', 'The Hague', 'Leiden', 'Delft', 'Gouda']
    },
    {
      name: 'Utrecht',
      code: 'UT',
      cities: ['Utrecht', 'Amersfoort', 'Zeist']
    },
    {
      name: 'North Brabant',
      code: 'NB',
      cities: ['Eindhoven', 'Tilburg', 'Breda', "'s-Hertogenbosch"]
    }
  ],

  // SAUDI ARABIA
  SA: [
    {
      name: 'Riyadh Province',
      cities: ['Riyadh', 'Al Kharj', 'Diriyah']
    },
    {
      name: 'Makkah Province',
      cities: ['Jeddah', 'Mecca', 'Taif']
    },
    {
      name: 'Eastern Province',
      cities: ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Al Ahsa']
    }
  ],

  // IRELAND
  IE: [
    {
      name: 'Leinster',
      cities: ['Dublin', 'Dundalk', 'Bray', 'Navan', 'Kilkenny']
    },
    {
      name: 'Munster',
      cities: ['Cork', 'Limerick', 'Waterford', 'Tralee']
    },
    {
      name: 'Connacht',
      cities: ['Galway', 'Sligo', 'Castlebar']
    }
  ]
};

// 3. Robust Helper Functions with Aliases and Fallbacks
export const findCountry = (query: string): CountryInfo | undefined => {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return GLOBAL_COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.code.toLowerCase() === q ||
      c.aliases?.some((a) => a.toLowerCase() === q)
  );
};

export const getStatesForCountry = (countryQuery: string): StateInfo[] => {
  const country = findCountry(countryQuery);
  if (!country) return [];
  return GLOBAL_STATES_CITIES[country.code] || [];
};

export const findState = (countryQuery: string, stateQuery: string): StateInfo | undefined => {
  const states = getStatesForCountry(countryQuery);
  if (!states.length || !stateQuery) return undefined;
  const q = stateQuery.trim().toLowerCase();
  return states.find(
    (s) => s.name.toLowerCase() === q || (s.code && s.code.toLowerCase() === q)
  );
};

export const getCitiesForState = (countryQuery: string, stateName: string): string[] => {
  const state = findState(countryQuery, stateName);
  return state?.cities || [];
};

export const getPostalConfig = (countryQuery: string) => {
  const country = findCountry(countryQuery);
  if (!country) {
    return {
      label: 'Postal / PIN Code',
      placeholder: 'Postal code',
      required: false,
      regex: undefined
    };
  }
  return {
    label: country.postalLabel,
    placeholder: country.postalPlaceholder,
    required: country.postalRequired,
    regex: country.postalRegex
  };
};
