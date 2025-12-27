import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, MapPin, Building, Home, Map, LayoutGrid, List } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';

const Locations = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const {
    filteredItems: locations,
    loading,
    isModalOpen,
    editingItem,
    formData,
    searchTerm,
    setSearchTerm,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete
  } = useDashboardCrud(
    api.getLocations,
    api.createLocation,
    api.updateLocation,
    api.deleteLocation,
    { 
      name: '', 
      city: '', 
      country: '',
      description: '', 
      image: '',
      lat: '',
      lng: ''
    },
    (loc, term) => loc.name.toLowerCase().includes(term.toLowerCase()) || loc.city.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('Locations')}</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2" /> {t('Add Location')}
        </Button>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('Search Locations...')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-border/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title={t('Grid View')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title={t('List View')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {loading ? (
            <div className="p-8 text-center text-gray-400">{t('loading')}</div>
        ) : locations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">{t('No locations found')}</div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {locations.map((location) => (
                <div key={location.id} className="glass-panel overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
                <div className="h-48 bg-gray-800 relative">
                    <img src={location.image || 'https://via.placeholder.com/400x200'} alt={location.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs text-white uppercase font-bold border border-white/10">
                    {location.city}, {location.country}
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-textDark dark:text-white mb-2">{location.name}</h3>
                    <p className="text-textLight dark:text-gray-400 text-sm mb-4 line-clamp-2">{location.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                        <div className="flex items-center justify-center text-primary mb-1"><Building size={16} /></div>
                        <div className="text-lg font-bold text-textDark dark:text-white">{location.stats?.projectsCount || 0}</div>
                        <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('Projects')}</div>
                    </div>
                    <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                        <div className="flex items-center justify-center text-green-400 mb-1"><Home size={16} /></div>
                        <div className="text-lg font-bold text-textDark dark:text-white">{location.stats?.unitsCount || 0}</div>
                        <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('Units')}</div>
                    </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/10 dark:border-white/5">
                    <div className="flex items-center text-sm text-textLight dark:text-gray-400">
                        <MapPin size={14} className="me-2" />
                        {location.lat?.toString().slice(0,6)}, {location.lng?.toString().slice(0,6)}
                    </div>
                    <div className="flex space-x-2">
                        <button 
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        onClick={() => handleOpenModal(location)}
                        title="Edit"
                        >
                        <Edit size={16} />
                        </button>
                        <button 
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        onClick={() => handleDelete(location.id)}
                        title="Delete"
                        >
                        <Trash size={16} />
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-textLight dark:text-gray-400 text-sm border-b border-border/20 dark:border-white/10">
                            <th className="p-4 font-medium">{t('Name')}</th>
                            <th className="p-4 font-medium">{t('Location')}</th>
                            <th className="p-4 font-medium text-center">{t('Projects')}</th>
                            <th className="p-4 font-medium text-center">{t('Units')}</th>
                            <th className="p-4 font-medium text-center">{t('Coordinates')}</th>
                            <th className="p-4 font-medium text-end">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 dark:divide-white/5">
                        {locations.map((location) => (
                            <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                            <img src={location.image || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-textDark dark:text-white">{location.name}</div>
                                            <div className="text-xs text-textLight dark:text-gray-500 truncate max-w-[200px]">{location.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-textDark dark:text-gray-300">
                                    {location.city}, {location.country}
                                </td>
                                <td className="p-4 text-center">
                                    <span className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary font-bold text-sm">
                                        {location.stats?.projectsCount || 0}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="inline-block px-2 py-1 rounded-md bg-green-500/10 text-green-500 font-bold text-sm">
                                        {location.stats?.unitsCount || 0}
                                    </span>
                                </td>
                                <td className="p-4 text-center text-xs text-mono text-textLight dark:text-gray-500">
                                    {location.lat?.toString().slice(0,6)}, {location.lng?.toString().slice(0,6)}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            onClick={() => handleOpenModal(location)}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(location.id)}
                                            title="Delete"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? `${t('Edit Location')}: ${editingItem.name}` : t('Add Location')}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label={t('Name')} 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input 
                label={t('City')} 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                label={t('Country')} 
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
              <Input 
                label={t('Image URL')} 
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://..."
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label={t('Latitude')} 
                name="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={handleInputChange}
              />
               <Input 
                label={t('Longitude')} 
                name="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={handleInputChange}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('Description')}</label>
            <textarea 
              className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary h-24 resize-none"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-white/5 mt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('Cancel')}</Button>
              <Button type="submit">{editingItem ? t('Save Changes') : t('Create Location')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Locations;
