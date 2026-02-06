import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, Map, Globe, LayoutGrid, List, Info } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { commonService } from '../../services/commonService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';

const Cities = () => {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  
  const {
    filteredItems: cities,
    loading,
    isModalOpen,
    editingItem,
    formData,
    setSearchTerm,
    searchTerm,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
    refresh
  } = useDashboardCrud(
    commonService.getCities,
    commonService.createCity,
    commonService.updateCity,
    commonService.deleteCity,
    { 
      nameEn: '', 
      nameAr: '',
      slug: '', 
      country: 'Egypt',
      region: ''
    },
    (city, term) => (
      city.nameEn?.toLowerCase().includes(term.toLowerCase()) || 
      city.nameAr?.toLowerCase().includes(term.toLowerCase()) ||
      city.slug?.toLowerCase().includes(term.toLowerCase())
    )
  );

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const onNameEnBlur = () => {
    if (!formData.slug && formData.nameEn) {
      handleInputChange({
        target: {
          name: 'slug',
          value: generateSlug(formData.nameEn)
        }
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('cities')}</h1>
        <div className="flex gap-3">
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addCity', 'Add City')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchCities', 'Search Cities...')}
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
        ) : cities.length === 0 ? (
            <div className="p-8 text-center text-gray-400">{t('noCitiesFound', 'No cities found')}</div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            {cities.map((city) => (
                <div key={city._id} className="glass-panel p-5 hover:border-primary/50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Map size={24} />
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                onClick={() => handleOpenModal(city)}
                            >
                                <Edit size={14} />
                            </button>
                            <button 
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                onClick={() => handleDelete(city._id)}
                            >
                                <Trash size={14} />
                            </button>
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-textDark dark:text-white mb-1">
                        {i18n.language === 'ar' ? city.nameAr : city.nameEn}
                    </h3>
                    <div className="text-sm text-textLight dark:text-gray-400 mb-2 flex items-center">
                        <Globe size={12} className="me-1 italic" /> {city.country}
                    </div>
                    <div className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded inline-block text-gray-500">
                        {city.slug}
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-textLight dark:text-gray-400 text-sm border-b border-border/20 dark:border-white/10">
                            <th className="p-4 font-medium">{t('nameEn', 'English Name')}</th>
                            <th className="p-4 font-medium">{t('nameAr', 'Arabic Name')}</th>
                            <th className="p-4 font-medium">{t('slug', 'Slug')}</th>
                            <th className="p-4 font-medium">{t('country', 'Country')}</th>
                            <th className="p-4 font-medium text-end">{t('actions', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 dark:divide-white/5">
                        {cities.map((city) => (
                            <tr key={city._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-textDark dark:text-white">{city.nameEn}</td>
                                <td className="p-4 text-textDark dark:text-gray-300">{city.nameAr}</td>
                                <td className="p-4 text-sm font-mono text-gray-500">{city.slug}</td>
                                <td className="p-4 text-sm text-gray-500">{city.country}</td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            onClick={() => handleOpenModal(city)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(city._id)}
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
        title={editingItem ? `${t('Edit City', 'Edit City')}: ${editingItem.nameEn}` : t('Add City', 'Add City')}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label={t('nameEn', 'English Name')} 
            name="nameEn"
            value={formData.nameEn}
            onChange={handleInputChange}
            onBlur={onNameEnBlur}
            required
            placeholder="e.g. Cairo"
          />
          <Input 
            label={t('nameAr', 'Arabic Name')} 
            name="nameAr"
            value={formData.nameAr}
            onChange={handleInputChange}
            required
            placeholder="مثال: القاهرة"
          />
          <Input 
            label={t('slug', 'Slug')} 
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            placeholder="e.g. cairo"
          />
          <Input 
            label={t('country', 'Country')} 
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="e.g. Egypt"
          />
          <Input 
            label={t('region', 'Region')} 
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            placeholder="e.g. Cairo Governorate"
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-white/5 mt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('Cancel')}</Button>
              <Button type="submit">{editingItem ? t('Save Changes') : t('Create City')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Cities;
