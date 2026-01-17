import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, ArrowRight, Shield } from 'lucide-react';

/**
 * LeadCaptureForm - Collects user contact info before starting chat
 * Submits to backend where it creates a Lead in CRM
 */
const LeadCaptureForm = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  // Egyptian phone validation: 01[0125]xxxxxxxx
  const validatePhone = (phone) => /^01[0125][0-9]{8}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired', 'الاسم مطلوب');
    }
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail', 'بريد إلكتروني غير صحيح');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('phoneRequired', 'رقم الهاتف مطلوب');
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('invalidPhone', 'رقم هاتف غير صحيح');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
          <span className="text-4xl">🏠</span>
        </div>
        <h3 className="text-xl font-black text-textDark dark:text-white mb-2">
          {t('welcomeToEstatePro', 'مرحباً بك في EstatePro')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('enterDetailsToChat', 'أدخل بياناتك للتحدث مع مساعدنا الذكي')}
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        {/* Name Field */}
        <div>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
            bg-white dark:bg-gray-800
            ${errors.name 
              ? 'border-red-400 focus-within:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'}
          `}>
            <User size={18} className={errors.name ? 'text-red-400' : 'text-gray-400'} />
            <input
              type="text"
              placeholder={t('fullName', 'الاسم الكامل')}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-textDark dark:text-white placeholder:text-gray-400"
              dir="rtl"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 text-right font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email Field (Optional) */}
        <div>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
            bg-white dark:bg-gray-800
            ${errors.email 
              ? 'border-red-400 focus-within:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'}
          `}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={errors.email ? 'text-red-400' : 'text-gray-400'}>
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              type="email"
              placeholder={t('email', 'البريد الإلكتروني (اختياري)')}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-textDark dark:text-white placeholder:text-gray-400"
              dir="ltr"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 text-right font-medium">{errors.email}</p>
          )}
        </div>
        
        {/* Phone Field */}
        <div>
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
            bg-white dark:bg-gray-800
            ${errors.phone 
              ? 'border-red-400 focus-within:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'}
          `}>
            <Phone size={18} className={errors.phone ? 'text-red-400' : 'text-gray-400'} />
            <input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={formData.phone}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData({ ...formData, phone: value });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-textDark dark:text-white placeholder:text-gray-400 tracking-wider"
              dir="ltr"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1 text-right font-medium">{errors.phone}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`
            w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all
            ${loading 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95'}
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
              <span>{t('loading', 'جاري التحميل...')}</span>
            </>
          ) : (
            <>
              <span>{t('startChat', 'ابدأ المحادثة')}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      
      {/* Privacy Note */}
      <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
        <Shield size={14} />
        <p>{t('privacyNote', 'بياناتك آمنة ولن نشاركها مع أي طرف ثالث')}</p>
      </div>
    </div>
  );
};

export default LeadCaptureForm;
