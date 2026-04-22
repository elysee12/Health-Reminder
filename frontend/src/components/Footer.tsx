import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language } = useAuth();

  const translations = {
    en: {
      brand: "mHealth Reminder",
      mission: "Empowering healthcare providers with integrated tools for effective hypertension management, patient adherence monitoring, and improved health outcomes across Rwanda.",
      partners: "Our Partners",
      copyright: `© ${currentYear} mHealth Reminder System. All Rights Reserved.`,
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    rw: {
      brand: "Sisitemu yo Ibibutsa by'Imiti",
      mission: "Gutanga imbogamizi z'ubuvuzi ifatima inzira z'itsinda kugira ngo harangwe neza umuvuduko w'amaraso munini, kugira ngo abarwayi bagumire gufata imiti, n'inyungu nziza y'intambwe.",
      partners: "Abakizi Bafite Uruhare",
      copyright: `© ${currentYear} Sisitemu yo Ibibutsa by'Imiti. Amahoro Yose Akuruyizwa.`,
      privacy: "Politiki y'Ubuzima bwabwe",
      terms: "Amategeko y'Ikoreshwa",
    },
  };

  const t = (key: keyof typeof translations.en) => translations[language === 'rw' ? 'rw' : 'en'][key];

  const partnersList = language === 'rw' 
    ? [
        "Minisiteri y'Ubuvuzi",
        "WHO Rwanda",
        "UNICEF Rwanda",
        "Health Centers Partners",
        "Community Health Workers"
      ]
    : [
        "Ministry of Health",
        "WHO Rwanda",
        "UNICEF Rwanda",
        "Health Centers Partners",
        "Community Health Workers"
      ];

  return (
    <footer className="w-full bg-[#1a2233] text-white py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left Section: Brand & Mission */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5">
                <Heart className="h-6 w-6 text-emerald-500" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">{t('brand')}</span>
            </div>
            <div className="h-0.5 w-12 bg-emerald-500"></div>
          </div>
          
          <p className="text-gray-400 text-base leading-relaxed max-w-md">
            {t('mission')}
          </p>

          <div className="flex gap-4">
            {[Facebook, Twitter, Instagram, Linkedin, Mail].map((Icon, i) => (
              <div 
                key={i} 
                className="h-10 w-10 rounded-full bg-[#2a3447] flex items-center justify-center cursor-pointer hover:bg-emerald-500 transition-colors duration-300"
              >
                <Icon className="h-5 w-5 text-gray-300 hover:text-white" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Partners */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">{t('partners')}</h4>
            <div className="h-1 w-12 bg-emerald-500"></div>
          </div>

          <div className="flex flex-wrap gap-3">
            {partnersList.map((partner) => (
              <div 
                key={partner}
                className="bg-white text-[#1a2233] px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-shadow"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>{t('copyright')}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="#" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <span className="hidden md:inline text-white/20">|</span>
            <Link to="#" className="hover:text-white transition-colors">{t('terms')}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
