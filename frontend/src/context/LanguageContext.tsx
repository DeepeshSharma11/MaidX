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
    
    // Client Home
    "welcome": "Welcome",
    "welcome_desc": "Find the best domestic help near you.",
    "find_maid": "Find a Helper",
    "find_maid_desc": "Search top-rated professionals for cleaning, cooking, and more.",
    "search_now": "Search Now",
    "bookings_desc": "View your upcoming appointments and past service history.",
    "view_bookings": "View Bookings",
    "verified_prof": "Verified Professionals",
    "verified_prof_desc": "All our helpers undergo strict background checks to ensure your safety.",
    "top_helpers": "Top Helpers",
    "see_all": "See all",
    "no_helpers": "No helpers available yet.",

    // Maid Home
    "upcoming_bookings": "Upcoming Bookings",
    "no_upcoming": "No upcoming bookings.",
    "view_all_bookings": "View all bookings",
    "rating": "Rating",
    "no_reviews": "No reviews yet",
    "my_reviews": "My Reviews",
    "see_feedback": "See client feedback",
    "bookings_desc_maid": "View & manage requests",
    "set_avail": "Set your availability",

    // Common/Find helpers page
    "set_location_nearby": "Set location to search nearby",
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
    "book_helper": "Book This Helper",
    "search_radius_label": "Search radius",
    "helpers_available": "helpers available",
    "searching": "Searching...",
    "sort_by_rating": "Sort by rating",
    "per_hour": "Per Hour",
    "distance": "Distance",
    "available_for_booking": "Available for booking",
    "bg_verified": "Background Verified",
    "bg_verified_desc": "Identity & background check passed",
    "no_bio": "This helper hasn't added a bio yet.",
    "book_this_helper": "Book This Helper",
    "no_helpers_found": "No helpers found nearby",
    "try_adjust_search": "Try increasing the search radius or changing the skill filter.",
    "verified_badge": "Verified",
    
    // Bookings page
    "my_bookings_title": "My Bookings",
    "upcoming": "Upcoming",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "pending": "Pending",
    "status": "Status",
    "duration": "Duration",
    "total_price": "Total Price",
    "cancel_booking": "Cancel Booking",
    "rate_professional": "Rate Helper",
    "write_review": "Write a Review",
    "how_was_service": "How was the service?",
    "submit_review": "Submit Review",
    "booking_cancelled": "Booking cancelled",
    "booking_confirmed": "Booking confirmed",
    "no_bookings_yet": "You have no bookings yet.",
    "cancel": "Cancel",
    "reviewed": "Reviewed",
    "review_submitted": "Review Submitted!",
    "thank_you_feedback": "Thank you for your feedback.",
    "rate_helper_title": "Rate Helper",
    "rating_feedback_desc": "Your feedback helps others choose the right helper",
    "comment_placeholder": "Tell us about your experience...",
    "submitting": "Submitting...",
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
    
    // Client Home
    "welcome": "स्वागत है",
    "welcome_desc": "अपने आस-पास सबसे अच्छे घरेलू मददगार खोजें।",
    "find_maid": "मददगार खोजें",
    "find_maid_desc": "सफ़ाई, खाना पकाने आदि के लिए टॉप-रेटेड पेशेवरों को खोजें।",
    "search_now": "अभी खोजें",
    "bookings_desc": "अपनी आने वाली नियुक्तियां और पुराना सेवा इतिहास देखें।",
    "view_bookings": "बुकिंग देखें",
    "verified_prof": "सत्यापित पेशेवर",
    "verified_prof_desc": "आपकी सुरक्षा सुनिश्चित करने के लिए हमारे सभी मददगारों की सख्त पृष्ठभूमि जांच की जाती है।",
    "top_helpers": "शीर्ष मददगार",
    "see_all": "सभी देखें",
    "no_helpers": "अभी कोई मददगार उपलब्ध नहीं है।",

    // Maid Home
    "upcoming_bookings": "आने वाली बुकिंग",
    "no_upcoming": "कोई आने वाली बुकिंग नहीं है।",
    "view_all_bookings": "सभी बुकिंग देखें",
    "rating": "रेटिंग",
    "no_reviews": "अभी कोई समीक्षा नहीं",
    "my_reviews": "मेरी समीक्षाएं",
    "see_feedback": "ग्राहकों की प्रतिक्रिया देखें",
    "bookings_desc_maid": "अनुरोध देखें और प्रबंधित करें",
    "set_avail": "अपनी उपलब्धता सेट करें",

    // Common/Find helpers page
    "set_location_nearby": "खोजने के लिए स्थान सेट करें",
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
    "book_helper": "इस मददगार को बुक करें",
    "search_radius_label": "खोज दायरा",
    "helpers_available": "मददगार उपलब्ध हैं",
    "searching": "खोज रहे हैं...",
    "sort_by_rating": "रेटिंग के अनुसार क्रमबद्ध करें",
    "per_hour": "प्रति घंटा",
    "distance": "दूरी",
    "available_for_booking": "बुकिंग के लिए उपलब्ध",
    "bg_verified": "पृष्ठभूमि सत्यापित",
    "bg_verified_desc": "पहचान और पृष्ठभूमि की जांच सफल रही",
    "no_bio": "इस मददगार ने अभी तक कोई परिचय नहीं जोड़ा है।",
    "book_this_helper": "इस मददगार को बुक करें",
    "no_helpers_found": "आस-पास कोई मददगार नहीं मिला",
    "try_adjust_search": "खोज का दायरा बढ़ाने या फ़िल्टर बदलने का प्रयास करें।",
    "verified_badge": "सत्यापित",
    
    // Bookings page
    "my_bookings_title": "मेरी बुकिंग",
    "upcoming": "आने वाली",
    "completed": "पूरी हो चुकी",
    "cancelled": "रद्द कर दी गई",
    "pending": "लंबित",
    "status": "स्थिति",
    "duration": "अवधि",
    "total_price": "कुल मूल्य",
    "cancel_booking": "बुकिंग रद्द करें",
    "rate_professional": "रेटिंग दें",
    "write_review": "समीक्षा लिखें",
    "how_was_service": "सेवा कैसी थी?",
    "submit_review": "समीक्षा सबमिट करें",
    "booking_cancelled": "बुकिंग रद्द कर दी गई",
    "booking_confirmed": "बुकिंग की पुष्टि हो गई",
    "no_bookings_yet": "आपकी अभी तक कोई बुकिंग नहीं है।",
    "cancel": "रद्द करें",
    "reviewed": "समीक्षा की गई",
    "review_submitted": "समीक्षा सबमिट हो गई!",
    "thank_you_feedback": "आपकी प्रतिक्रिया के लिए धन्यवाद।",
    "rate_helper_title": "मददगार को रेट करें",
    "rating_feedback_desc": "आपकी प्रतिक्रिया दूसरों को सही मददगार चुनने में मदद करती है",
    "comment_placeholder": "हमें अपने अनुभव के बारे में बताएं...",
    "submitting": "सबमिट किया जा रहा है...",
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
