import React, { useState } from 'react';
import { Filter, X, Search, DollarSign, Home, CheckCircle, Bed, MapPin } from 'lucide-react';
import Button from '../shared/Button';
import { useCurrency } from '../../context/CurrencyContext';

const FilterSidebar = ({ filters, setFilters, isOpen, onClose }) => {
  const { getCurrency } = useCurrency();
  const currency = getCurrency();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      status: '',
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-80 glass-panel z-[100] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-y-auto border-r border-border shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading text-textDark flex items-center gap-2">
              <Filter size={20} className="text-primary" /> Filters
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-primary/10 text-textLight hover:text-textDark transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              name="search"
              placeholder="Search..."
              value={localFilters.search}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background dark:bg-white/5 border border-border text-textDark placeholder-textLight/50 focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-textDark mb-4">
              <DollarSign size={16} className="text-primary" /> Price Range ({currency.code})
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight text-[10px] font-bold uppercase tracking-tight pointer-events-none">{currency.symbolEn}</span>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-2 rounded-lg bg-background dark:bg-white/5 border border-border text-textDark text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight text-[10px] font-bold uppercase tracking-tight pointer-events-none">{currency.symbolEn}</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-2 rounded-lg bg-background dark:bg-white/5 border border-border text-textDark text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-textDark mb-4">
              <Home size={16} className="text-primary" /> Property Type
            </label>
            <div className="space-y-2">
              {['Apartment', 'Villa', 'Penthouse', 'Studio'].map((type) => (
                <label key={type} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.type === type.toLowerCase() ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                    {localFilters.type === type.toLowerCase() && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <input
                    type="radio"
                    name="type"
                    value={type.toLowerCase()}
                    checked={localFilters.type === type.toLowerCase()}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className={`text-sm ${localFilters.type === type.toLowerCase() ? 'text-textDark font-medium' : 'text-textLight group-hover:text-textDark'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-textDark mb-4">
              <MapPin size={16} className="text-primary" /> Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="Enter city or area..."
              value={localFilters.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-background dark:bg-white/5 border border-border text-textDark placeholder-textLight/50 focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-textDark mb-4">
              <Bed size={16} className="text-primary" /> Bedrooms
            </label>
            <select
              name="beds"
              value={localFilters.beds}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-background dark:bg-white/5 border border-border text-textDark focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer hover:bg-primary/5 transition-colors [&>option]:bg-section"
            >
              <option value="">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-textDark mb-4">
              <Activity size={16} className="text-primary" /> Status
            </label>
            <select
              name="status"
              value={localFilters.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-background dark:bg-white/5 border border-border text-textDark focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer hover:bg-primary/5 transition-colors [&>option]:bg-section"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border flex flex-col gap-3">
            <Button onClick={handleApply} className="w-full shadow-md hover:shadow-lg">
              Apply Filters
            </Button>
            <button 
              onClick={handleReset}
              className="w-full py-3 text-sm text-textDark/70 hover:text-textDark transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Helper icon
const Activity = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

export default FilterSidebar;
