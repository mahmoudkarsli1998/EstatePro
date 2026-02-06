import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Filter, Home, DollarSign, Maximize, Layers, Download, MapPin, Star, Eye, Clock, Crown, Bed, Bath, Car, LayoutTemplate, List, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import EntityImage from '../../components/shared/EntityImage';
import { estateService } from '../../services/estateService';
import { crmService } from '../../services/crmService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationsContext';
import { commonService } from '../../services/commonService';
import UnitStatusControl from '../../components/dashboard/UnitStatusControl';

const Units = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { format, formatCompact } = useCurrency();
    const { createNotification } = useNotifications();
    const [viewMode, setViewMode] = useState('list');
    // Secure Fetcher to enforce Draft Privacy
    const [projects, setProjects] = useState([]);
    const [cities, setCities] = useState([]);

    // Load Initial Data
    useEffect(() => {
        estateService.getProjects().then(setProjects).catch(console.error);
        commonService.getCities().then(setCities).catch(console.error);
    }, []);

    const secureGetUnits = React.useCallback(async () => {
        const data = await estateService.getUnits();
        // Filter: Hide drafts if not owner. Hide 'sold' if sales user didn't create it? No, only drafts are private.
        // Spec: "Draft units are private... visible only to creator"
        return data.filter(u => u.status !== 'draft' || u.createdById === user?.id);
    }, [user?.id]);

    const getProjectName = (projectId) => {
        if (!projectId && !projects.length) return '';
        // Handle both 'project' (ID string) and 'projectId'
        const id = typeof projectId === 'object' ? projectId?._id || projectId?.id : projectId;
        const proj = projects.find(p => (p.id === id || p._id === id));
        return proj ? proj.name : '';
    };

    const getCityName = (slug) => {
        if (!slug || !cities.length) return slug || '';
        const city = cities.find(c => c.slug === slug);
        if (!city) return slug;
        return i18n.language === 'ar' ? city.nameAr : city.nameEn;
    };

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
        secureGetUnits,
        estateService.createUnit,
        estateService.updateUnit,
        estateService.deleteUnit,
        { 
        number: '', type: 'residential', floor: '', area_m2: '', 
        price: '', status: 'available', projectId: '', phaseId: '', blockId: '',
        features: { bedrooms: 0, bathrooms: 0 },
        image: null
        },
        (unit, term) => {
            const termLower = term.toLowerCase();
            const projName = getProjectName(unit.project || unit.projectId).toLowerCase();
            return (
                unit.number?.toLowerCase().includes(termLower) || 
                unit.titleEn?.toLowerCase().includes(termLower) ||
                unit.type?.toLowerCase().includes(termLower) ||
                projName.includes(termLower)
            );
        }
    );

    // Dependent Data States
    const [phases, setPhases] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [showFilters, setShowFilters] = useState(false); // Toggle for filter panel
    
    // User Mapping State
    const [usersMap, setUsersMap] = useState({});

    // Fetch and Map Users/Agents
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch all potential creators: Users, Managers, Admins, Agents
                // To keep it efficient, we can fetch 'assignable' (Agents+Sales) and 'users' (Admins/Managers)
                // But crmService.getAssignableUsers only returns Agents/Sales. 
                // We might need a broader list if Units are created by Admins.
                // Best effort: Get assignable users + current user (if admin)
                // For full coverage we might needs crmService.getUsers() if accessible
                
                const [assignable, allUsers] = await Promise.all([
                    crmService.getAssignableUsers().catch(() => []),
                    crmService.getUsers().catch(() => []) 
                ]);

                const map = {};
                
                // Process all users
                [...allUsers, ...assignable].forEach(u => {
                    const id = u.id || u._id;
                    if (id) {
                        map[id] = {
                            name: u.fullName || u.name || 'Unknown',
                            role: u.role || 'user',
                            avatar: u.avatar || u.image
                        };
                    }
                });

                // Also ensure current user is in map
                if (user && (user.id || user._id)) {
                    map[user.id || user._id] = {
                         name: user.fullName || user.name,
                         role: user.role,
                         avatar: user.avatar || user.image
                    };
                }

                setUsersMap(map);
            } catch (err) {
                console.error("Error fetching users for mapping:", err);
            }
        };
        fetchUsers();
    }, [user]);

    // Load Phases/Blocks when Project changes (in Modal)
    useEffect(() => {
        if (formData.projectId) {
        estateService.getProjectPhases(formData.projectId).then(setPhases);
        estateService.getProjectBlocks(formData.projectId).then(setBlocks);
        } else {
        setPhases([]);
        setBlocks([]);
        }
    }, [formData.projectId]);

    // Stats Calculation
    const stats = React.useMemo(() => {
        const sourceData = filteredItems || [];
        const total = sourceData.length;
        
        const totalValue = sourceData.reduce((sum, u) => {
             // Robust price parsing: handle strings with commas, currency symbols, etc.
             const priceString = String(u.price || 0);
             const cleanPrice = priceString.replace(/[^0-9.-]+/g,"");
             return sum + (Number(cleanPrice) || 0);
        }, 0);

        const available = sourceData.filter(u => String(u.status).toLowerCase() === 'available').length;
        const sold = sourceData.filter(u => String(u.status).toLowerCase() === 'sold').length;
        
        return { total, totalValue, available, sold };
    }, [filteredItems]);

    const onExport = () => {
        handleExport(
        "units_export.csv",
        ["ID", "Number/Title", "Project", "Type", "Area", "Price", "Status", "Created By"],
        u => {
            const creatorId = typeof u.createdById === 'object' 
                ? (u.createdById?.id || u.createdById?._id) 
                : u.createdById;
            const creator = usersMap[creatorId] || (typeof u.createdById === 'object' ? u.createdById : {});
            
            return [
                u.id, 
                `"${u.number || u.titleEn}"`, 
                `"${getProjectName(u.project || u.projectId)}"`,
                u.type, 
                u.area_m2, 
                u.price, 
                u.status,
                `"${creator.name || creator.fullName || 'System'}"`
            ].join(",")
        }
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
        await estateService.updateUnit(unit.id, { isFavorite: newStatus });
        createNotification({
            title: newStatus ? t('addedToFavorites') : t('removedFromFavorites'),
            type: 'info',
            duration: 3000
        });
    };

    const handleUnitUpdate = async (result) => {
        if (result?.deleted) {
            const idToDelete = result.id || result._id;
            setAllItems(prev => prev.filter(u => String(u.id) !== String(idToDelete) && String(u._id) !== String(idToDelete)));
            return;
        }
        // Otherwise simple refresh by re-fetching all items
        const freshUnits = await secureGetUnits();
        setAllItems(freshUnits);
    };

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white flex items-center gap-2">
            <Home className="text-primary" size={28} />
            {t('units', 'Units Management')}
        </h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-border/20 shadow-sm">
             <div className="text-xs text-textLight uppercase font-bold tracking-wider mb-1">{t('totalUnits', 'Total Units')}</div>
             <div className="text-2xl font-black text-textDark dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-border/20 shadow-sm">
             <div className="text-xs text-textLight uppercase font-bold tracking-wider mb-1">{t('totalValue', 'Total Value')}</div>
             <div className="text-2xl font-black text-primary">{formatCompact(stats.totalValue)}</div>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-border/20 shadow-sm">
             <div className="text-xs text-textLight uppercase font-bold tracking-wider mb-1">{t('available', 'Available')}</div>
             <div className="text-2xl font-black text-green-500">{stats.available}</div>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-border/20 shadow-sm">
             <div className="text-xs text-textLight uppercase font-bold tracking-wider mb-1">{t('sold', 'Sold')}</div>
             <div className="text-2xl font-black text-red-500">{stats.sold}</div>
          </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
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
             <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-border/10 me-4">
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title={t('List View')}
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => setViewMode('board')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title={t('Board View')}
                >
                    <LayoutTemplate size={18} />
                </button>
            </div>
            
            <span className="text-sm text-textLight hidden md:inline">{t('sortBy')}: </span>
            <select className="bg-transparent border border-border/20 rounded px-2 py-1 text-sm outline-none hidden md:block">
                <option>{t('newest')}</option>
                <option>{t('priceLowToHigh')}</option>
                <option>{t('priceHighToLow')}</option>
            </select>
            <div className="flex items-center gap-2 ms-4 hidden md:flex">
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
                   <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                 ))}
              </select>

              <Button variant="ghost" onClick={() => setActiveFilters({})}>
                 {t('clearFilters')}
              </Button>
           </div>
        )}

        {/* View Content */}
        {viewMode === 'list' ? (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-section/50 text-textLight font-medium text-xs uppercase tracking-wider hidden md:table-header-group">
                <tr className="border-b border-border/10">
                    <th className="px-4 py-3 text-start w-10"></th>
                    <th className="px-4 py-3 text-end">{t('unit')}</th>
                    <th className="px-4 py-3 text-end">{t('details')}</th>
                    {user?.role !== 'sales' && <th className="px-4 py-3 text-center">{t('user')}</th>}
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
              ) : units.map((unit) => {
                const creatorId = typeof unit.createdById === 'object' 
                    ? (unit.createdById?.id || unit.createdById?._id) 
                    : unit.createdById;
                const creator = usersMap[creatorId] || (typeof unit.createdById === 'object' ? unit.createdById : {});
                
                const creatorName = creator?.name || creator?.fullName || 'System';
                const creatorRole = creator?.role || 'Admin';
                return (
                <tr key={unit.id || unit._id} className="group hover:bg-section dark:hover:bg-white/5 transition-all duration-200">
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
                          
                          {/* Project Name Badge */}
                          {getProjectName(unit.project || unit.projectId) && (
                            <span className="text-xs text-secondary font-medium bg-secondary/10 px-2 py-0.5 rounded mt-0.5">
                                {getProjectName(unit.project || unit.projectId)}
                            </span>
                          )}

                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                             {t(unit.category) || 'For Sale'}
                          </span>
                       </div>
                       <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 border border-border/20">
                          <EntityImage 
                            src={unit.images?.[0]} 
                            alt={unit.number}
                            type="unit"
                            className="w-full h-full object-cover"
                          />
                       </div>
                    </div>
                  </td>

                  {/* Details: Price + Location + Features */}
                  <td className="px-4 py-4 align-top w-[250px]">
                    <div className="flex flex-col items-end gap-2 text-end">
                        <div className="text-primary font-bold text-lg flex items-center gap-1">
                            <DollarSign size={16} />
                            {format(unit.price || 0)}
                        </div>
                        <div className="text-sm text-textDark dark:text-gray-300 capitalize">{t(unit.type)}</div>
                        <div className="flex items-center gap-1 text-xs text-textLight">
                             <span>{getCityName(unit.city) || 'Cairo'}</span>
                             <MapPin size={12} />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                            <span className="flex items-center gap-1 text-xs" title="Bedrooms">
                                {unit.features?.bedrooms || unit.bedrooms || 0} <Bed size={12} />
                            </span>
                            <span className="flex items-center gap-1 text-xs" title="Bathrooms">
                                {unit.features?.bathrooms || unit.bathrooms || 0} <Bath size={12} />
                            </span>
                             <span className="flex items-center gap-1 text-xs" title="Area">
                                {unit.area_m2}m² <Maximize size={12} />
                            </span>
                            {unit.features?.parking && (
                               <span className="flex items-center gap-1 text-xs text-blue-400" title="Parking">
                                   <Car size={12} />
                               </span>
                            )}
                        </div>
                    </div>
                  </td>

                  {/* User / Agent */}
                  {user?.role !== 'sales' && (
                  <td className="px-4 py-4 align-middle text-center">
                     <div className="flex flex-col items-center gap-1">
                        <div className="font-medium text-sm text-textDark dark:text-white flex items-center gap-1">
                             {creatorName} 
                             {creatorRole === 'admin' ? (
                                <Crown size={12} className="text-yellow-500 fill-yellow-500" />
                             ) : (
                                <Users size={12} className="text-blue-500" />
                             )}
                        </div>
                        <div className="text-xs text-textLight capitalize">{creatorRole}</div>
                     </div>
                  </td>
                  )}

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
                            <Eye size={12} /> {unit.views || 0}
                        </span>
                        <span className="flex items-center gap-1 mt-1" title={new Date(unit.updatedAt || unit.createdAt).toLocaleString()}>
                            <Clock size={12} /> {
                                (() => {
                                    const date = new Date(unit.updatedAt || unit.createdAt || Date.now());
                                    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
                                    if (diff === 0) return t('today');
                                    if (diff === 1) return t('yesterday');
                                    return `${diff}d ago`;
                                })()
                            }
                        </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* Delete: Restricted for Sales */}
                      {user?.role !== 'sales' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(unit.id || unit._id)}
                          title={t('delete')}
                        >
                          <Trash size={18} />
                        </button>
                      )}
                      
                      <button 
                        className={`p-2 transition-colors ${unit.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        onClick={() => handleToggleFavorite(unit)}
                        title={t('favorite')}
                      >
                         <Star size={18} fill={unit.isFavorite ? "currentColor" : "none"} />
                      </button>
                      
                       <button 
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          onClick={() => handleOpenModal(unit)}
                          title={t('quickEdit', 'Quick Edit')}
                       >
                          <Edit size={18} />
                       </button>

                       {(user?.role !== 'sales' || unit.createdById === user.id) && (
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          onClick={() => navigate(`/dashboard/units/edit/${unit.id || unit._id}`)}
                          title={t('fullEdit', 'Full Edit')}
                        >
                          <Layers size={18} />
                        </button>
                      )}
                      <button 
                         className="p-2 text-gray-400 hover:text-primary transition-colors"
                         title={t('view')}
                         onClick={() => navigate(`/units/${unit.id || unit._id}`)} 
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        ) : (
            <div className="p-6 overflow-x-auto h-full flex-1">
                <div className="flex gap-6 h-full min-w-max pb-4">
                    {['available', 'reserved', 'sold', 'rented'].map(status => {
                        const statusUnits = units.filter(u => status === 'available' ? (u.status === 'active' || u.status === 'available') : u.status === status);
                        return (
                            <div key={status} className="w-80 flex flex-col h-full bg-section/30 rounded-xl border border-border/10">
                                <div className={`p-4 border-b border-border/10 flex justify-between items-center ${
                                    status === 'available' ? 'border-t-4 border-t-green-500' : 
                                    status === 'reserved' ? 'border-t-4 border-t-yellow-500' : 
                                    status === 'sold' ? 'border-t-4 border-t-red-500' : 
                                    'border-t-4 border-t-blue-500'
                                } rounded-t-xl bg-background/50`}>
                                    <h3 className="font-bold text-textDark dark:text-white capitalize">{t(status)}</h3>
                                    <span className="bg-background dark:bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold">{statusUnits.length}</span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[600px] scrollbar-hide">
                                    {statusUnits.length === 0 && (
                                        <div className="text-center text-gray-400 text-sm italic py-4">No units</div>
                                    )}
                                    {statusUnits.map(unit => (
                                        <div key={unit.id || unit._id} className="bg-background dark:bg-dark-card border border-border/10 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
                                            <div className="h-32 mb-3 rounded-md overflow-hidden bg-gray-200">
                                                <EntityImage 
                                                  src={unit.images?.[0]} 
                                                  alt={unit.number}
                                                  type="unit"
                                                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-bold text-textDark dark:text-white truncate max-w-[150px]">{unit.number}</div>
                                                <div className="font-bold text-primary text-sm">{formatCompact(unit.price)}</div>
                                            </div>
                                             <div className="text-xs text-textLight flex items-center gap-1 mb-2">
                                                <MapPin size={10} /> {getCityName(unit.city)}
                                             </div>
                                            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-border/10 pt-2 mt-2 mb-3">
                                                <div className="flex gap-2">
                                                    <span className="flex items-center gap-0.5"><Bed size={10} /> {unit.features?.bedrooms}</span>
                                                    <span className="flex items-center gap-0.5"><Maximize size={10} /> {unit.area_m2}m²</span>
                                                    {unit.features?.parking && (
                                                       <span className="flex items-center gap-0.5 text-blue-400" title="Parking">
                                                           <Car size={10} />
                                                       </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-black/50 backdrop-blur rounded p-1">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(unit); }} className="text-white hover:text-primary" title={t('quickEdit')}><Edit size={12} /></button>
                                                    {(user?.role !== 'sales' || unit.createdById === user.id) && (
                                                      <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/units/edit/${unit.id || unit._id}`); }} className="text-white hover:text-blue-300" title={t('fullEdit')}><Layers size={12} /></button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Status Quick Controls */}
                                            <div className="mt-2" onClick={e => e.stopPropagation()}>
                                                <UnitStatusControl 
                                                    unit={unit} 
                                                    onUpdate={handleUnitUpdate} 
                                                    size="sm"
                                                    layout="horizontal"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

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
        {/* Quick Edit Modal */}
        <Modal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            title={editingItem ? `${t('editUnit')}: ${formData.number || t('unit')}` : t('addNewUnit')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label={t('unitNumber')} 
                        name="number" 
                        value={formData.number} 
                        onChange={handleInputChange} 
                        required 
                    />
                    <Input 
                        label={t('price')} 
                        name="price" 
                        type="number" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('status')}</label>
                   <select 
                     name="status"
                     value={formData.status}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary"
                   >
                     <option value="available">{t('available')}</option>
                     <option value="sold">{t('sold')}</option>
                     <option value="reserved">{t('reserved')}</option>
                     <option value="rented">{t('rented')}</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('phase')}</label>
                        <select 
                            name="phaseId"
                            value={formData.phaseId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary"
                        >
                            <option value="">{t('selectPhase')}</option>
                            {phases.map(p => (
                                <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('block')}</label>
                        <select 
                            name="blockId"
                            value={formData.blockId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary"
                        >
                            <option value="">{t('selectBlock')}</option>
                            {blocks.map(b => (
                                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                    {editingItem && (
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={() => setFormData(editingItem)}
                            title={t('resetToOriginal')}
                        >
                            {t('reset')}
                        </Button>
                    )}
                    <Button variant="ghost" type="button" onClick={handleCloseModal}>{t('cancel')}</Button>
                    <Button type="submit" loading={loading}>{t('saveChanges')}</Button>
                </div>
            </form>
        </Modal>
    </div>
  );
};

export default Units;
