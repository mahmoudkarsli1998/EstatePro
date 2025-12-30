import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown } from 'lucide-react';
import Button from '../shared/Button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const HeroSearch = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('compounds'); // 'compounds' | 'units'
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (propertyType) params.append('type', propertyType);
    
    // Parse price range logic (mock implementation)
    if (priceRange === '0-1m') {
      params.append('minPrice', '0');
      params.append('maxPrice', '1000000');
    } else if (priceRange === '1m-5m') {
      params.append('minPrice', '1000000');
      params.append('maxPrice', '5000000');
    } else if (priceRange === '5m+') {
      params.append('minPrice', '5000000');
    }

    if (activeTab === 'compounds') {
      navigate({
        pathname: '/projects',
        search: params.toString()
      });
    } else {
      // Units search
      navigate({
        pathname: '/units',
        search: params.toString()
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10 backdrop-blur-md bg-section/95 dark:bg-black/60">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'compounds'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('compounds')}
        >
          {t('compounds')}
        </button>
        <button
          className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'units'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('units')}
        >
          {t('units', 'Units')}
        </button>
      </div>

      {/* Search Content */}
      <div className="p-6">
        {/* Main Search Input */}
        <div className="relative mb-0">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white placeholder-textLight dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:bg-background/80 dark:focus:bg-white/10 transition-all text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Filters Row (Always Visible) */}
        <div className="block opacity-100">
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <div className="flex-1 relative">
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >

                <option value="" className="bg-background dark:bg-dark-bg">{t('propertyTypes')}</option>
                <option value="apartment" className="bg-background dark:bg-dark-bg">{t('apartment')}</option>
                <option value="villa" className="bg-background dark:bg-dark-bg">{t('villa')}</option>
                <option value="townhouse" className="bg-background dark:bg-dark-bg">{t('townhouse')}</option>
                <option value="office" className="bg-background dark:bg-dark-bg">{t('office')}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >


                <option value="" className="bg-dark-bg">{t('bedsAndBaths')}</option>
                <option value="1" className="bg-background dark:bg-dark-bg">{t('onePlusBed')}</option>
                <option value="2" className="bg-background dark:bg-dark-bg">{t('twoPlusBeds')}</option>
                <option value="3" className="bg-background dark:bg-dark-bg">{t('threePlusBeds')}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >


                <option value="" className="bg-dark-bg">{t('priceRange')}</option>
                <option value="0-1m" className="bg-background dark:bg-dark-bg">{t('under1M')}</option>
                <option value="1m-5m" className="bg-background dark:bg-dark-bg">{t('oneToFiveM')}</option>
                <option value="5m+" className="bg-background dark:bg-dark-bg">{t('fiveMPlus')}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="w-full md:w-auto">
              <Button 
                onClick={handleSearch}
                className="w-full md:w-32 h-full justify-center font-bold text-white shadow-lg hover:shadow-xl"
              >
                {t('search')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
