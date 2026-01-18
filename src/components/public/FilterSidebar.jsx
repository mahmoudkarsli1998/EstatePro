import React, { useState } from 'react';
import { Filter, X, Search, DollarSign, Home, CheckCircle } from 'lucide-react';
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 md:top-24 left-0 h-full md:h-[calc(100vh-8rem)] w-80 glass-panel z-50 md:z-0 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-y-auto border-r md:border border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center md:hidden">
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Filter size={20} className="text-primary" /> Filters
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              name="search"
              placeholder="Search projects..."
              value={localFilters.search}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <DollarSign size={16} className="text-primary" /> Price Range ({currency.code})
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">{currency.symbolEn}</span>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={handleChange}
                  className="w-full pl-6 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">{currency.symbolEn}</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={handleChange}
                  className="w-full pl-6 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <Home size={16} className="text-primary" /> Property Type
            </label>
            <div className="space-y-2">
              {['Apartment', 'Villa', 'Penthouse', 'Studio'].map((type) => (
                <label key={type} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.type === type.toLowerCase() ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-primary/50'}`}>
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
                  <span className={`text-sm ${localFilters.type === type.toLowerCase() ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <Activity size={16} className="text-primary" /> Status
            </label>
            <select
              name="status"
              value={localFilters.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors [&>option]:bg-[#050510]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Selling</option>
              <option value="upcoming">Upcoming Projects</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <Button onClick={handleApply} className="w-full shadow-md hover:shadow-lg">
              Apply Filters
            </Button>
            <button 
              onClick={handleReset}
              className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
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
