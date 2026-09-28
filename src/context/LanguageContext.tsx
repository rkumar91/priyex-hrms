import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'es';

export interface LanguageOption {
  code: LanguageCode;
  name: string; // Native name
  englishName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav
    'nav.coreModules': 'Core Modules',
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.supportDesk': 'Live Support Desk',
    'nav.requests': 'Requests & Approvals',
    'nav.attendance': 'Attendance & Leave',
    'nav.payroll': 'Payroll & Compensation',
    'nav.organization': 'Organization',
    'nav.usersRoles': 'User & Roles',
    'nav.auditLogs': 'Audit & Compliance',
    'nav.more': 'More',
    // Header
    'header.searchPlaceholder': 'Search directory, requests, records...',
    'header.companyName': 'Priyex Software Enterprise',
    'header.supportPool': 'Pool',
    'header.notifications': 'Notifications',
    'header.myProfile': 'My Profile',
    'header.signOut': 'Sign Out',
    'header.theme': 'Theme Color',
    'header.language': 'Language',
    // Dashboard
    'dash.welcomeBack': 'Welcome back',
    'dash.enterprisePortal': 'Enterprise HR & Workforce Portal',
    'dash.applyLeave': 'Apply for Leave',
    'dash.viewPayslips': 'View Payslips',
    'dash.addEmployee': 'Add Employee',
    'dash.downloadReport': 'Download Report',
    'dash.quickActions': 'Quick Actions',
    'dash.recentActivity': 'Recent Activity',
    'dash.kpi.daysPresent': 'Days Present',
    'dash.kpi.leaveBalance': 'Leave Balance',
    'dash.kpi.latestNetPay': 'Latest Net Pay',
    'dash.kpi.activeRequests': 'Active Requests',
    'dash.kpi.totalStaff': 'Total Staff',
    'dash.kpi.presentToday': 'Present Today',
    'dash.kpi.staffOnLeave': 'Staff On Leave',
    'dash.kpi.monthlyPayroll': 'Monthly Payroll',
    'dash.kpi.onTime': 'on-time attendance',
    'dash.kpi.daysAvailable': 'Days Available',
    'dash.kpi.inReview': 'In Review',
    'dash.kpi.availableLeaves': 'annual leaves remaining',
    'dash.kpi.credited': 'Credited on Aug 31',
    'dash.kpi.awaitingApproval': 'Casual leave awaiting approval',
  },
  hi: {
    // Nav
    'nav.coreModules': 'मुख्य मॉड्यूल',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.employees': 'कर्मचारी सूची',
    'nav.supportDesk': 'लाइव सहायता डेस्क',
    'nav.requests': 'अनुरोध और अनुमोदन',
    'nav.attendance': 'उपस्थिति और अवकाश',
    'nav.payroll': 'वेतन और मुआवजा',
    'nav.organization': 'संगठन संरचना',
    'nav.usersRoles': 'उपयोगकर्ता और भूमिकाएं',
    'nav.auditLogs': 'ऑडिट और अनुपालन',
    'nav.more': 'अधिक',
    // Header
    'header.searchPlaceholder': 'निर्देशिका, अनुरोध, रिकॉर्ड खोजें...',
    'header.companyName': 'प्रियैक्स सॉफ्टवेयर एंटरप्राइज',
    'header.supportPool': 'सहायता पूल',
    'header.notifications': 'सूचनाएं',
    'header.myProfile': 'मेरी प्रोफाइल',
    'header.signOut': 'लॉग आउट करें',
    'header.theme': 'थीम रंग',
    'header.language': 'भाषा चुनें',
    // Dashboard
    'dash.welcomeBack': 'स्वागत है',
    'dash.enterprisePortal': 'एंटरप्राइज एचआर और कार्यबल पोर्टल',
    'dash.applyLeave': 'अवकाश के लिए आवेदन करें',
    'dash.viewPayslips': 'वेतन पर्ची देखें',
    'dash.addEmployee': 'नया कर्मचारी जोड़ें',
    'dash.downloadReport': 'रिपोर्ट डाउनलोड करें',
    'dash.quickActions': 'त्वरित कार्रवाई',
    'dash.recentActivity': 'हाल की गतिविधि',
    'dash.kpi.daysPresent': 'उपस्थित दिन',
    'dash.kpi.leaveBalance': 'अवकाश शेष',
    'dash.kpi.latestNetPay': 'नवीनतम शुद्ध वेतन',
    'dash.kpi.activeRequests': 'सक्रिय अनुरोध',
    'dash.kpi.totalStaff': 'कुल कर्मचारी',
    'dash.kpi.presentToday': 'आज उपस्थित',
    'dash.kpi.staffOnLeave': 'अवकाश पर कर्मचारी',
    'dash.kpi.monthlyPayroll': 'मासिक पेरोल',
    'dash.kpi.onTime': 'समय पर उपस्थिति',
    'dash.kpi.daysAvailable': 'दिन उपलब्ध',
    'dash.kpi.inReview': 'समीक्षाधीन',
    'dash.kpi.availableLeaves': 'वार्षिक अवकाश शेष',
    'dash.kpi.credited': '31 अगस्त को जमा किया गया',
    'dash.kpi.awaitingApproval': 'अनुमोदन की प्रतीक्षा में',
  },
  mr: {
    // Nav
    'nav.coreModules': 'प्रमुख मॉड्यूल्स',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.employees': 'कर्मचारी यादी',
    'nav.supportDesk': 'थेट सपोर्ट डेस्क',
    'nav.requests': 'विनंत्या आणि मंजुरी',
    'nav.attendance': 'हजेरी आणि रजा',
    'nav.payroll': 'पगार आणि भरपाई',
    'nav.organization': 'संस्था रचना',
    'nav.usersRoles': 'वापरकर्ते आणि भूमिका',
    'nav.auditLogs': 'ऑडिट आणि नियमपालन',
    'nav.more': 'अधिक',
    // Header
    'header.searchPlaceholder': 'कर्मचारी, विनंती, नोंदी शोधा...',
    'header.companyName': 'प्रियॅक्स सॉफ्टवेअर एंटरप्राइज',
    'header.supportPool': 'पूल',
    'header.notifications': 'सूचना',
    'header.myProfile': 'माझी प्रोफाइल',
    'header.signOut': 'लॉग आऊट',
    'header.theme': 'थीम रंग',
    'header.language': 'भाषा निवडा',
    // Dashboard
    'dash.welcomeBack': 'पुन्हा स्वागत आहे',
    'dash.enterprisePortal': 'एंटरप्राइज एचआर आणि कार्यबल पोर्टल',
    'dash.applyLeave': 'रजेसाठी अर्ज करा',
    'dash.viewPayslips': 'पगार स्लिप पहा',
    'dash.addEmployee': 'नवीन कर्मचारी जोडा',
    'dash.downloadReport': 'अहवाल डाउनलोड करा',
    'dash.quickActions': 'जलद कृती',
    'dash.recentActivity': 'अलीकडील घडामोडी',
    'dash.kpi.daysPresent': 'हजर दिवस',
    'dash.kpi.leaveBalance': 'शिल्लक रजा',
    'dash.kpi.latestNetPay': 'नवीनतम निव्वळ पगार',
    'dash.kpi.activeRequests': 'सक्रिय विनंत्या',
    'dash.kpi.totalStaff': 'एकूण कर्मचारी',
    'dash.kpi.presentToday': 'आज उपस्थित',
    'dash.kpi.staffOnLeave': 'रजेवर असलेले कर्मचारी',
    'dash.kpi.monthlyPayroll': 'मासिक पगार वितरण',
    'dash.kpi.onTime': 'वेळेवर हजेरी',
    'dash.kpi.daysAvailable': 'दिवस उपलब्ध',
    'dash.kpi.inReview': 'तपासणी सुरू',
    'dash.kpi.availableLeaves': 'वार्षिक रजा शिल्लक',
    'dash.kpi.credited': '३१ ऑगस्ट रोजी जमा',
    'dash.kpi.awaitingApproval': 'मंजुरीची प्रतीक्षा',
  },
  gu: {
    // Nav
    'nav.coreModules': 'મુખ્ય મોડ્યુલ્સ',
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.employees': 'કર્મચારી યાદી',
    'nav.supportDesk': 'લાઇવ સપોર્ટ ડેસ્ક',
    'nav.requests': 'વિનંતીઓ અને મંજૂરી',
    'nav.attendance': 'હાજરી અને રજા',
    'nav.payroll': 'પગાર અને વળતર',
    'nav.organization': 'સંસ્થાનું માળખું',
    'nav.usersRoles': 'વપરાશકર્તાઓ અને ભૂમિકાઓ',
    'nav.auditLogs': 'ઓડિટ અને નિયમપાલન',
    'nav.more': 'વધુ',
    // Header
    'header.searchPlaceholder': 'ડિરેક્ટરી, વિનંતીઓ, રેકોર્ડ શોધો...',
    'header.companyName': 'પ્રિયેક્સ સોફ્ટવેર એન્ટરપ્રાઇઝ',
    'header.supportPool': 'પૂલ',
    'header.notifications': 'સૂચનાઓ',
    'header.myProfile': 'મારી પ્રોફાઇલ',
    'header.signOut': 'લૉગ આઉટ',
    'header.theme': 'થીમ રંગ',
    'header.language': 'ભાષા પસંદ કરો',
    // Dashboard
    'dash.welcomeBack': 'સ્વાગત છે',
    'dash.enterprisePortal': 'એન્ટરપ્રાઇઝ એચઆર પોર્ટલ',
    'dash.applyLeave': 'રજા માટે અરજી કરો',
    'dash.viewPayslips': 'પગાર સ્લિપ જુઓ',
    'dash.addEmployee': 'કર્મચારી ઉમેરો',
    'dash.downloadReport': 'અહેવાલ ડાઉનલોડ કરો',
    'dash.quickActions': 'ઝડપી પગલાં',
    'dash.recentActivity': 'તાજેતરની પ્રવૃત્તિ',
    'dash.kpi.daysPresent': 'હાજર દિવસો',
    'dash.kpi.leaveBalance': 'બાકી રજાઓ',
    'dash.kpi.latestNetPay': 'ચોખ્ખો પગાર',
    'dash.kpi.activeRequests': 'સક્રિય વિનંતીઓ',
    'dash.kpi.totalStaff': 'કુલ કર્મચારીઓ',
    'dash.kpi.presentToday': 'આજે હાજર',
    'dash.kpi.staffOnLeave': 'રજા પર કર્મચારીઓ',
    'dash.kpi.monthlyPayroll': 'માસિક પગાર',
    'dash.kpi.onTime': 'સમયસર હાજરી',
    'dash.kpi.daysAvailable': 'દિવસો ઉપલબ્ધ',
    'dash.kpi.inReview': 'સમીક્ષા હેઠળ',
    'dash.kpi.availableLeaves': 'વાર્ષિક રજાઓ બાકી',
    'dash.kpi.credited': '૩૧ ઓગસ્ટે જમા',
    'dash.kpi.awaitingApproval': 'મંજૂરી બાકી',
  },
  ta: {
    // Nav
    'nav.coreModules': 'முக்கிய தொகுதிகள்',
    'nav.dashboard': 'முகப்பு பலகை',
    'nav.employees': 'பணியாளர்கள்',
    'nav.supportDesk': 'நேரலை உதவி மையம்',
    'nav.requests': 'கோரிக்கைகள் & ஒப்புதல்கள்',
    'nav.attendance': 'வருகை & விடுப்பு',
    'nav.payroll': 'ஊதியம் & சம்பளம்',
    'nav.organization': 'நிறுவன அமைப்பு',
    'nav.usersRoles': 'பயனர்கள் & பாத்திரங்கள்',
    'nav.auditLogs': 'தணிக்கை பதிவுகள்',
    'nav.more': 'மேலும்',
    // Header
    'header.searchPlaceholder': 'தேடுக...',
    'header.companyName': 'பிரியெக்ஸ் மென்பொருள் நிறுவனம்',
    'header.supportPool': 'உதவி வரிசை',
    'header.notifications': 'அறிவிப்புகள்',
    'header.myProfile': 'என் சுயவிவரம்',
    'header.signOut': 'வெளியேறு',
    'header.theme': 'வண்ண தீம்',
    'header.language': 'மொழி தேர்வு',
    // Dashboard
    'dash.welcomeBack': 'மீண்டும் வருக',
    'dash.enterprisePortal': 'நிறுவன மனிதவள தளம்',
    'dash.applyLeave': 'விடுப்புக்கு விண்ணப்பிக்கவும்',
    'dash.viewPayslips': 'சம்பள சீட்டை பார்க்கவும்',
    'dash.addEmployee': 'புதிய பணியாளர் சேர்',
    'dash.downloadReport': 'அறிக்கை பதிவிறக்கு',
    'dash.quickActions': 'விரைவு நடவடிக்கைகள்',
    'dash.recentActivity': 'சமீபத்திய நடவடிக்கைகள்',
    'dash.kpi.daysPresent': 'வருகை நாட்கள்',
    'dash.kpi.leaveBalance': 'மீதமுள்ள விடுப்பு',
    'dash.kpi.latestNetPay': 'நிகர ஊதியம்',
    'dash.kpi.activeRequests': 'செயலில் உள்ள கோரிக்கைகள்',
    'dash.kpi.totalStaff': 'மொத்த ஊழியர்கள்',
    'dash.kpi.presentToday': 'இன்று வந்தவர்கள்',
    'dash.kpi.staffOnLeave': 'விடுப்பில் உள்ளவர்கள்',
    'dash.kpi.monthlyPayroll': 'மாத சம்பள பட்டியல்',
    'dash.kpi.onTime': 'நேரத்திற்கு வருகை',
    'dash.kpi.daysAvailable': 'நாட்கள் உள்ளன',
    'dash.kpi.inReview': 'பரிசீலனையில்',
    'dash.kpi.availableLeaves': 'மீதமுள்ள வருடாந்திர விடுப்பு',
    'dash.kpi.credited': 'ஆகஸ்ட் 31 அன்று வரவு வைக்கப்பட்டது',
    'dash.kpi.awaitingApproval': 'ஒப்புதலுக்காக காத்திருக்கிறது',
  },
  te: {
    // Nav
    'nav.coreModules': 'ప్రధాన మాడ్యూల్స్',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.employees': 'ఉద్యోగులు',
    'nav.supportDesk': 'లైవ్ సపోర్ట్ డెస్క్',
    'nav.requests': 'అభ్యర్థనలు & ఆమోదాలు',
    'nav.attendance': 'హాజరు & సెలవులు',
    'nav.payroll': 'జీతం & పరిహారం',
    'nav.organization': 'సంస్థ నిర్మాణం',
    'nav.usersRoles': 'వినియోగదారులు & పాత్రలు',
    'nav.auditLogs': 'ఆడిట్ లాగ్స్',
    'nav.more': 'మరిన్ని',
    // Header
    'header.searchPlaceholder': 'శోధించండి...',
    'header.companyName': 'ప్రియెక్స్ సాఫ్ట్‌వేర్ ఎంటర్‌ప్రైజ్',
    'header.supportPool': 'పూల్',
    'header.notifications': 'నోటిఫికేషన్లు',
    'header.myProfile': 'నా ప్రొఫైల్',
    'header.signOut': 'లాగ్ అవుట్',
    'header.theme': 'థీమ్ రంగు',
    'header.language': 'భాష ఎంచుకోండి',
    // Dashboard
    'dash.welcomeBack': 'స్వాగతం',
    'dash.enterprisePortal': 'ఎంటర్‌ప్రైజ్ హెచ్ఆర్ పోర్టల్',
    'dash.applyLeave': 'సెలవు కోసం దరఖాస్తు చేసుకోండి',
    'dash.viewPayslips': 'పేస్లిప్‌లను చూడండి',
    'dash.addEmployee': 'ఉద్యోగిని జోడించండి',
    'dash.downloadReport': 'నివేదికను డౌన్‌లోడ్ చేయండి',
    'dash.quickActions': 'శీఘ్ర చర్యలు',
    'dash.recentActivity': 'ఇటీవలి కార్యాచరణ',
    'dash.kpi.daysPresent': 'హాజరైన రోజులు',
    'dash.kpi.leaveBalance': 'సెలవుల నిల్వ',
    'dash.kpi.latestNetPay': 'నికర జీతం',
    'dash.kpi.activeRequests': 'క్రియాశీల అభ్యర్థనలు',
    'dash.kpi.totalStaff': 'మొత్తం ఉద్యోగులు',
    'dash.kpi.presentToday': 'ఈరోజు హాజరైనవారు',
    'dash.kpi.staffOnLeave': 'సెలవులో ఉన్నవారు',
    'dash.kpi.monthlyPayroll': 'నెలవారీ పేరోల్',
    'dash.kpi.onTime': 'సమయానికి హాజరు',
    'dash.kpi.daysAvailable': 'రోజులు అందుబాటులో ఉన్నాయి',
    'dash.kpi.inReview': 'సమీక్షలో ఉంది',
    'dash.kpi.availableLeaves': 'వార్షిక సెలవులు మిగిలి ఉన్నాయి',
    'dash.kpi.credited': 'ఆగస్టు 31న జమ చేయబడింది',
    'dash.kpi.awaitingApproval': 'ఆమోదం కోసం వేచి ఉంది',
  },
  es: {
    // Nav
    'nav.coreModules': 'Módulos Principales',
    'nav.dashboard': 'Panel de Control',
    'nav.employees': 'Empleados',
    'nav.supportDesk': 'Mesa de Ayuda en Vivo',
    'nav.requests': 'Solicitudes y Aprobaciones',
    'nav.attendance': 'Asistencia y Permisos',
    'nav.payroll': 'Nómina y Salarios',
    'nav.organization': 'Organización',
    'nav.usersRoles': 'Usuarios y Roles',
    'nav.auditLogs': 'Auditoría y Cumplimiento',
    'nav.more': 'Más',
    // Header
    'header.searchPlaceholder': 'Buscar en directorio, registros...',
    'header.companyName': 'Priyex Software Enterprise',
    'header.supportPool': 'Cola',
    'header.notifications': 'Notificaciones',
    'header.myProfile': 'Mi Perfil',
    'header.signOut': 'Cerrar Sesión',
    'header.theme': 'Color del Tema',
    'header.language': 'Seleccionar Idioma',
    // Dashboard
    'dash.welcomeBack': 'Bienvenido de nuevo',
    'dash.enterprisePortal': 'Portal Empresarial de Gestión Humana',
    'dash.applyLeave': 'Solicitar Permiso',
    'dash.viewPayslips': 'Ver Recibos de Pago',
    'dash.addEmployee': 'Añadir Empleado',
    'dash.downloadReport': 'Descargar Informe',
    'dash.quickActions': 'Acciones Rápidas',
    'dash.recentActivity': 'Actividad Reciente',
    'dash.kpi.daysPresent': 'Días Presente',
    'dash.kpi.leaveBalance': 'Saldo de Permisos',
    'dash.kpi.latestNetPay': 'Último Salario Neto',
    'dash.kpi.activeRequests': 'Solicitudes Activas',
    'dash.kpi.totalStaff': 'Personal Total',
    'dash.kpi.presentToday': 'Presentes Hoy',
    'dash.kpi.staffOnLeave': 'Personal de Permiso',
    'dash.kpi.monthlyPayroll': 'Nómina Mensual',
    'dash.kpi.onTime': 'asistencia a tiempo',
    'dash.kpi.daysAvailable': 'Días Disponibles',
    'dash.kpi.inReview': 'En Revisión',
    'dash.kpi.availableLeaves': 'días de vacaciones restantes',
    'dash.kpi.credited': 'Acreditado el 31 de agosto',
    'dash.kpi.awaitingApproval': 'Pendiente de aprobación',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageOption: LanguageOption;
  availableLanguages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('priyex_hrms_lang') as LanguageCode;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('priyex_hrms_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        availableLanguages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
