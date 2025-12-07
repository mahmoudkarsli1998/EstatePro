import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, MapPin, Upload, DollarSign, Send } from 'lucide-react';
import LiquidBackground from '../../components/shared/LiquidBackground';
import Button from '../../components/shared/Button';
import { useToast } from '../../context/ToastContext';

const Sell = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    location: '',
    area: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(t('listingSubmissionSuccess') || 'Your property has been submitted for review!', 5000);
      // Reset form or redirect
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold font-heading text-white mb-4">{t('sellYourUnit')}</h1>
            <p className="text-gray-400 text-lg">{t('sellYourUnitDesc') || "List your property with us and reach thousands of potential buyers."}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 md:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">{t('propertyType')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="apartment">{t('apartment')}</option>
                      <option value="villa">{t('villa')}</option>
                      <option value="chalet">{t('chalet')}</option>
                      <option value="office">{t('office')}</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">{t('location')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={t('enterLocation') || "e.g. Downtown Dubai"}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">{t('expectedPrice')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">{t('area')} (sqm)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. 150"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">{t('description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t('propertyDescriptionPlaceholder') || "Describe the key features and selling points..."}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-white font-bold mb-4">{t('contactInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('fullName')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('phoneNumber')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('submitting')}...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send size={20} className="mr-2" />
                      {t('submitListing')}
                    </span>
                  )}
                </Button>
              </div>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
