import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';

const FilterSidebar = ({ filters, setFilters, isOpen, onClose }) => {
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 md:top-24 left-0 h-full md:h-[calc(100vh-8rem)] w-80 glass-panel z-50 md:z-0 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold font-heading text-white">Filters</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <Input
                label="Search"
                name="search"
                placeholder="Search projects..."
                value={localFilters.search}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  name="minPrice"
                  type="number"
                  value={localFilters.minPrice}
                  onChange={handleChange}
                  className="glass-input"
                />
                <Input
                  placeholder="Max"
                  name="maxPrice"
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Property Type
              </label>
              <select
                name="type"
                value={localFilters.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-card/50 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="" className="bg-dark-bg">All Types</option>
                <option value="apartment" className="bg-dark-bg">Apartment</option>
                <option value="villa" className="bg-dark-bg">Villa</option>
                <option value="penthouse" className="bg-dark-bg">Penthouse</option>
                <option value="studio" className="bg-dark-bg">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={localFilters.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-card/50 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="" className="bg-dark-bg">All Statuses</option>
                <option value="active" className="bg-dark-bg">Active</option>
                <option value="upcoming" className="bg-dark-bg">Upcoming</option>
                <option value="sold_out" className="bg-dark-bg">Sold Out</option>
              </select>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={handleApply} className="w-full shadow-[0_0_15px_rgba(0,240,255,0.3)]">Apply Filters</Button>
              <Button variant="ghost" onClick={handleReset} className="w-full">Reset</Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
