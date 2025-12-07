import React, { useState, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Button from '../shared/Button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const HeroSearch = () => {
  const [activeTab, setActiveTab] = useState('compounds');
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const filtersRef = useRef(null);
  const navigate = useNavigate();

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useGSAP(() => {
    if (isExpanded) {
      gsap.to(filtersRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
    } else {
      gsap.to(filtersRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      });
    }
  }, { scope: containerRef, dependencies: [isExpanded] });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (propertyType) params.append('type', propertyType);
    
    // Parse price range logic (mock implementation)
    if (priceRange === '0-1m') {
      params.append('maxPrice', '1000000');
    } else if (priceRange === '1m-5m') {
      params.append('minPrice', '1000000');
      params.append('maxPrice', '5000000');
    } else if (priceRange === '5m+') {
      params.append('minPrice', '5000000');
    }

    if (activeTab === 'compounds') {
      params.append('isCompound', 'true'); // Assuming backend supports this
    }

    navigate({
      pathname: '/projects',
      search: params.toString()
    });
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-black/40">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'compounds'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('compounds')}
        >
          Compounds
        </button>
        <button
          className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'properties'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
      </div>

      {/* Search Content */}
      <div className="p-6">
        {/* Main Search Input */}
        <div className="relative mb-0">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
          <input
            type="text"
            placeholder="Search by Area, Compound, or Developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-lg"
            onFocus={() => setIsExpanded(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Filters Row (Collapsible) */}
        <div ref={filtersRef} className="h-0 opacity-0 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <div className="flex-1 relative">
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-white/10 text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-white/5 backdrop-blur-sm"
              >
                <option value="" className="bg-dark-bg">Property Types</option>
                <option value="apartment" className="bg-dark-bg">Apartment</option>
                <option value="villa" className="bg-dark-bg">Villa</option>
                <option value="townhouse" className="bg-dark-bg">Townhouse</option>
                <option value="office" className="bg-dark-bg">Office</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-white/10 text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-white/5 backdrop-blur-sm"
              >
                <option value="" className="bg-dark-bg">Beds and Baths</option>
                <option value="1" className="bg-dark-bg">1+ Bed</option>
                <option value="2" className="bg-dark-bg">2+ Beds</option>
                <option value="3" className="bg-dark-bg">3+ Beds</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-white/10 text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-white/5 backdrop-blur-sm"
              >
                <option value="" className="bg-dark-bg">Price Range</option>
                <option value="0-1m" className="bg-dark-bg">Under 1M</option>
                <option value="1m-5m" className="bg-dark-bg">1M - 5M</option>
                <option value="5m+" className="bg-dark-bg">5M+</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="w-full md:w-auto">
              <Button 
                onClick={handleSearch}
                className="w-full md:w-32 h-full justify-center font-bold text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
