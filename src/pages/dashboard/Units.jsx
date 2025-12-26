import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Filter, Home, DollarSign, Maximize, Layers, Download, MapPin, Star, Eye, Clock, Crown, Bed, Bath, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Units = () => {
  const { t } = useTranslation();
  const {
    paginatedItems: units, // Use paginated items
    filteredItems, // keep full list for count
    loading,
    isModalOpen,
    editingItem,
    formData,
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleExport,
    setFormData,
    setAllItems
  } = useDashboardCrud(
    api.getUnits,
    api.createUnit,
    api.updateUnit,
    api.deleteUnit,
    { 
      number: '', type: 'residential', floor: '', area_m2: '', 
      price: '', status: 'available', projectId: '', phaseId: '', blockId: '',
      features: { bedrooms: 0, bathrooms: 0 },
      image: null
    },
    (unit, term) => 
      unit.number.toLowerCase().includes(term.toLowerCase()) || 
      unit.type.toLowerCase().includes(term.toLowerCase())
  );

  // Dependent Data States
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Toggle for filter panel

  // Load Projects on Mount
  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  // Load Phases/Blocks when Project changes (in Modal)
  useEffect(() => {
    if (formData.projectId) {
      api.getPhases(formData.projectId).then(setPhases);
      api.getBlocks(formData.projectId).then(setBlocks);
    } else {
      setPhases([]);
      setBlocks([]);
    }
  }, [formData.projectId]);

  const onExport = () => {
    handleExport(
      "units_export.csv",
      ["ID", "Number", "Type", "Floor", "Area", "Price", "Status", "Project ID"],
      u => [u.id, `"${u.number}"`, u.type, u.floor, u.area_m2, u.price, u.status, u.projectId].join(",")
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'sold': return 'danger'; // Red/Neutral for sold
      default: return 'default';
    }
  };

  const navigate = useNavigate();

  const handleAddUnit = () => {
    navigate('/dashboard/units/add');
  };

  const handleToggleFavorite = async (unit) => {
    // Optimistic update
    const newStatus = !unit.isFavorite;
    
    // Update local state immediately
    setAllItems(prev => prev.map(u => 
        u.id === unit.id ? { ...u, isFavorite: newStatus } : u
    ));

    // Persist to API
    await api.updateUnit(unit.id, { isFavorite: newStatus });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('units', 'Units Management')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
             {t('print')}
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={handleAddUnit}>
             <Plus size={20} className="me-2" /> {t('addNewUnit')} ({units.length})
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Button variant={showFilters ? "primary" : "ghost"} size="sm" className="hidden md:flex" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={18} className="me-2" /> {t('filter')}
             </Button>
             <div className="relative w-full md:w-80">
                <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('searchUnits', 'Search units...')}
                  className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-textLight">{t('sortBy')}: </span>
            <select className="bg-transparent border border-border/20 rounded px-2 py-1 text-sm outline-none">
                <option>{t('newest')}</option>
                <option>{t('priceLowToHigh')}</option>
                <option>{t('priceHighToLow')}</option>
            </select>
            <div className="flex items-center gap-2 ms-4">
                 <input type="checkbox" id="selectAll" className="rounded border-gray-300 text-primary focus:ring-primary" />
                 <label htmlFor="selectAll" className="text-sm select-none">{t('selectAll')}</label>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
           <div className="p-4 bg-section/30 border-b border-border/20 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
              <select 
                className="p-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 outline-none text-textDark dark:text-white [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                value={activeFilters.status || ''}
                onChange={(e) => setActiveFilters(prev => ({...prev, status: e.target.value}))}
              >
                 <option value="">{t('allStatuses', 'All Statuses')}</option>
                 <option value="available">{t('available')}</option>
                 <option value="reserved">{t('reserved')}</option>
                 <option value="sold">{t('sold')}</option>
              </select>

              <select 
                className="p-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 outline-none text-textDark dark:text-white [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                value={activeFilters.type || ''}
                onChange={(e) => setActiveFilters(prev => ({...prev, type: e.target.value}))}
              >
                 <option value="">{t('allTypes', 'All Types')}</option>
                 <option value="apartment">{t('apartment')}</option>
                 <option value="villa">{t('villa')}</option>
                 <option value="office">{t('office')}</option>
                 <option value="commercial">{t('commercial')}</option>
              </select>

              <select 
                className="p-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 outline-none text-textDark dark:text-white [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                value={activeFilters.projectId || ''}
                onChange={(e) => setActiveFilters(prev => ({...prev, projectId: e.target.value}))}
              >
                 <option value="">{t('allProjects', 'All Projects')}</option>
                 {projects.map(p => (
                   <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
              </select>

              <Button variant="ghost" onClick={() => setActiveFilters({})}>
                 {t('clearFilters')}
              </Button>
           </div>
        )}

        {/* Table/List View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-section/50 text-textLight font-medium text-xs uppercase tracking-wider hidden md:table-header-group">
                <tr className="border-b border-border/10">
                    <th className="px-4 py-3 text-start w-10"></th>
                    <th className="px-4 py-3 text-end">{t('unit')}</th>
                    <th className="px-4 py-3 text-end">{t('details')}</th>
                    <th className="px-4 py-3 text-center">{t('user')}</th>
                    <th className="px-4 py-3 text-center">{t('status')}</th>
                    <th className="px-4 py-3 text-center">{t('stats', 'Stats')}</th>
                    <th className="px-4 py-3 text-center">{t('actions')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-textLight">{t('loading')}...</td></tr>
              ) : units.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-textLight">{t('noUnitsFound')}</td></tr>
              ) : units.map((unit) => (
                <tr key={unit.id} className="group hover:bg-section dark:hover:bg-white/5 transition-all duration-200">
                  {/* Checkbox */}
                  <td className="px-4 py-4 text-center align-middle">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  </td>

                  {/* Unit: Image + Title + Info */}
                  <td className="px-4 py-4 align-top w-[350px]">
                    <div className="flex gap-4 justify-end">
                       <div className="flex flex-col text-end items-end gap-1 flex-1 min-w-0">
                          <h3 className="font-bold text-textDark dark:text-white truncate w-full" title={unit.titleEn || unit.number}>
                             {unit.titleEn || unit.number}
                          </h3>
                          <span className="text-xs text-textLight font-mono bg-section dark:bg-white/10 px-1 rounded">{unit.number}</span>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                             {t(unit.category) || 'For Sale'}
                          </span>
                       </div>
                       <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 border border-border/20">
                          {unit.images && unit.images.length > 0 ? (
                             <img src={unit.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Home size={24} />
                             </div>
                          )}
                       </div>
                    </div>
                  </td>

                  {/* Details: Price + Location + Features */}
                  <td className="px-4 py-4 align-top w-[250px]">
                    <div className="flex flex-col items-end gap-2 text-end">
                        <div className="text-primary font-bold text-lg">${(unit.price || 0).toLocaleString()}</div>
                        <div className="text-sm text-textDark dark:text-gray-300 capitalize">{t(unit.type)}</div>
                        <div className="flex items-center gap-1 text-xs text-textLight">
                             <span>{unit.city || 'Cairo'}</span>
                             <MapPin size={12} />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                            <span className="flex items-center gap-1 text-xs" title="Bedrooms">
                                {unit.features?.bedrooms || 0} <Bed size={12} />
                            </span>
                            <span className="flex items-center gap-1 text-xs" title="Bathrooms">
                                {unit.features?.bathrooms || 0} <Bath size={12} />
                            </span>
                             <span className="flex items-center gap-1 text-xs" title="Area">
                                {unit.area_m2}m² <Maximize size={12} />
                            </span>
                        </div>
                    </div>
                  </td>

                  {/* User / Agent */}
                  <td className="px-4 py-4 align-middle text-center">
                     <div className="flex flex-col items-center gap-1">
                        <div className="font-medium text-sm text-textDark dark:text-white flex items-center gap-1">
                             Admin <Crown size={12} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="text-xs text-textLight">Rent Department</div>
                     </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 align-middle text-center">
                     <Badge variant={getStatusColor(unit.status)} className="w-full justify-center">
                        {t(unit.status) || unit.status}
                     </Badge>
                  </td>

                  {/* Stats */}
                  <td className="px-4 py-4 align-top text-center">
                    <div className="flex flex-col items-center gap-1 text-xs text-textLight">
                        <span className="flex items-center gap-1">
                            <Eye size={12} /> {Math.floor(Math.random() * 100)}
                        </span>
                        <span className="flex items-center gap-1 mt-1">
                            <Clock size={12} /> {t('2daysAgo', '2d ago')}
                        </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => handleDelete(unit.id)}
                        title={t('delete')}
                      >
                        <Trash size={18} />
                      </button>
                      <button 
                        className={`p-2 transition-colors ${unit.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        onClick={() => handleToggleFavorite(unit)}
                        title={t('favorite')}
                      >
                         <Star size={18} fill={unit.isFavorite ? "currentColor" : "none"} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={() => navigate(`/dashboard/units/edit/${unit.id}`)}
                        title={t('edit')}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                         className="p-2 text-gray-400 hover:text-primary transition-colors"
                         title={t('view')}
                         onClick={() => navigate(`/units/${unit.id}`)} 
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/20 flex items-center justify-between">
            <span className="text-sm text-textLight">
                {t('showing')} {units.length} {t('of')} {filteredItems.length} {t('units')}
            </span>
            <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-lg border border-border/20 disabled:opacity-50 hover:bg-section dark:hover:bg-white/5 md:w-auto w-10 h-10 flex items-center justify-center"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                   <span className="hidden md:inline">{t('previous')}</span>
                   <span className="md:hidden">{'<'}</span>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                       key={page}
                       className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                           currentPage === page 
                           ? 'bg-primary text-white' 
                           : 'text-textLight hover:bg-section dark:hover:bg-white/5'
                       }`}
                       onClick={() => setCurrentPage(page)}
                    >
                       {page}
                    </button>
                ))}

                <button 
                  className="p-2 rounded-lg border border-border/20 disabled:opacity-50 hover:bg-section dark:hover:bg-white/5 md:w-auto w-10 h-10 flex items-center justify-center"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                   <span className="hidden md:inline">{t('next')}</span>
                   <span className="md:hidden">{'>'}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Units;
