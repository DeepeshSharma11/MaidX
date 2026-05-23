"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Client settings
    "settings": "Settings",
    "manage_account": "Manage your account preferences and security.",
    "notif_pref": "Notification Preferences",
    "sys_notif": "System Notifications",
    "sys_notif_desc": "Get alerts for new bookings, messages, and status updates on this device.",
    "save_pref": "Save Preferences",
    "change_pw": "Change Password",
    "current_pw": "Current Password",
    "new_pw": "New Password",
    "confirm_new_pw": "Confirm New Password",
    "update_pw": "Update Password",
    "account_info": "Account Info",
    "name": "Name",
    "role": "Role",
    "account": "Account",
    "logout_desc": "Log out from your account on this device.",
    "logout": "Log Out",
    "saved": "Saved!",
    "pw_updated": "Password changed successfully!",
    "language": "Language",
    "select_lang": "Select Language",
    "lang_desc": "Choose your preferred language for the interface.",
    "english": "English",
    "hindi": "Hindi (हिंदी)",
    
    // Sidebar / MobileNav
    "home": "Home",
    "search": "Search",
    "bookings": "Bookings",
    "profile": "Profile",
    "support": "Support",
    "search_maids": "Search Helpers",
    "my_bookings": "My Bookings",
    "my_schedule": "My Schedule",
    "schedule": "Schedule",
    "overview": "Overview",
    "users": "Users",
    "tickets": "Tickets",
    
    // Find helpers / map
    "find_helpers": "Find Helpers",
    "list_only": "List only",
    "show_map": "Show map",
    "search_radius": "Search radius",
    "all": "All",
    "cleaning": "Cleaning",
    "cooking": "Cooking",
    "laundry": "Laundry",
    "baby_care": "Baby Care",
    "elderly_care": "Elderly Care",
    "pet_care": "Pet Care",
    "skills_expertise": "Skills & Expertise",
    "about": "About",
    "availability": "Availability",
    "available_booking": "Available for booking",
    "reviews": "Reviews",
    "book_helper": "Book This Helper"
  },
  hi: {
    // Client settings
    "settings": "सेटिंग्स",
    "manage_account": "अपनी खाता प्राथमिकताओं और सुरक्षा को प्रबंधित करें।",
    "notif_pref": "अधिसूचना प्राथमिकताएं",
    "sys_notif": "सिस्टम अधिसूचनाएं",
    "sys_notif_desc": "इस डिवाइस पर नई बुकिंग, संदेशों और स्थिति अपडेट के लिए अलर्ट प्राप्त करें।",
    "save_pref": "प्राथमिकताएं सहेजें",
    "change_pw": "पासवर्ड बदलें",
    "current_pw": "वर्तमान पासवर्ड",
    "new_pw": "नया पासवर्ड",
    "confirm_new_pw": "नए पासवर्ड की पुष्टि करें",
    "update_pw": "पासवर्ड अपडेट करें",
    "account_info": "खाता जानकारी",
    "name": "नाम",
    "role": "भूमिका",
    "account": "खाता",
    "logout_desc": "इस डिवाइस पर अपने खाते से लॉग आउट करें।",
    "logout": "लॉग आउट",
    "saved": "सहेज लिया गया!",
    "pw_updated": "पासवर्ड सफलतापूर्वक बदला गया!",
    "language": "भाषा",
    "select_lang": "भाषा चुनें",
    "lang_desc": "इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।",
    "english": "English (अंग्रेज़ी)",
    "hindi": "हिंदी",
    
    // Sidebar / MobileNav
    "home": "होम",
    "search": "खोजें",
    "bookings": "बुकिंग",
    "profile": "प्रोफ़ाइल",
    "support": "सहायता",
    "search_maids": "मददगार खोजें",
    "my_bookings": "मेरी बुकिंग",
    "my_schedule": "मेरा शेड्यूल",
    "schedule": "शेड्यूल",
    "overview": "अवलोकन",
    "users": "उपयोगकर्ता",
    "tickets": "टिकट",
    
    // Find helpers / map
    "find_helpers": "मददगार खोजें",
    "list_only": "केवल सूची",
    "show_map": "नक्शा दिखाएं",
    "search_radius": "खोज दायरा",
    "all": "सभी",
    "cleaning": "सफ़ाई",
    "cooking": "खाना बनाना",
    "laundry": "कपड़े धोना",
    "baby_care": "बच्चों की देखभाल",
    "elderly_care": "बुजुर्गों की देखभाल",
    "pet_care": "पालतू जानवरों की देखभाल",
    "skills_expertise": "कौशल और विशेषज्ञता",
    "about": "बारे में",
    "availability": "उपलब्धता",
    "available_booking": "बुकिंग के लिए उपलब्ध",
    "reviews": "समीक्षाएं",
    "book_helper": "इस मददगार को बुक करें"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("maidx_language") as Language;
    if (saved === "en" || saved === "hi") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("maidx_language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
