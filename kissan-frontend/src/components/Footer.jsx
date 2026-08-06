import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-stone-100 border-t border-stone-200 mt-auto" 
    >
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                <Sprout size={18} className="text-white" />
              </div>
              <span className="font-bold text-stone-800">Kisan</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              {t.footerTagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-800 mb-3 text-sm uppercase tracking-wider">
              {t.footerPlatform}
            </h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><a href="#" className="hover:text-green-700 transition-colors">{t.footerPrivacy}</a></li>
              <li><a href="#" className="hover:text-green-700 transition-colors">{t.footerTerms}</a></li>
              <li><a href="#" className="hover:text-green-700 transition-colors">{t.footerContact}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-800 mb-3 text-sm uppercase tracking-wider">
              {t.footerContact}
            </h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-green-600" /> 0800-KISAN-01
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-green-600" /> support@kisan.pk
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-green-600" /> Lahore, Punjab, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Kisan. {t.footerRights}
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span className="text-xs">Made for Pakistani Agriculture</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}