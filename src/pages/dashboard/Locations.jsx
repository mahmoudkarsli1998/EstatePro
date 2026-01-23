import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, MapPin, Building, Home, Map, LayoutGrid, List, Upload, Image, Eye, ExternalLink, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { locationsService } from '../../services/locationsService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';
import { estateService } from '../../services/estateService';
import { uploadService } from '../../services/uploadService';
import EntityImage from '../../components/shared/EntityImage';

const Locations = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [projects, setProjects] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const {
    filteredItems: locations,
    loading,
    isModalOpen,
    editingItem,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    handleOpenModal: baseOpenModal,
    handleCloseModal: baseCloseModal,
    handleInputChange,
    handleSubmit: baseSubmit,
    handleDelete,
    handleExport,
    refresh
  } = useDashboardCrud(
    locationsService.getLocations,
    locationsService.createLocation,
    locationsService.updateLocation,
    locationsService.deleteLocation,
    { 
      name: '', 
      slug: '',
      city: '', 
      country: '',
      description: '', 
      image: '',
      lat: '',
      lng: '',
      projectIds: []
    },
    (loc, term) => (loc.name?.toLowerCase().includes(term.toLowerCase()) || loc.city?.toLowerCase().includes(term.toLowerCase()))
  );

  // Load projects for selection
  useEffect(() => {
    estateService.getProjects().then(setProjects).catch(console.error);
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Custom open modal to reset file state
  const handleOpenModal = (item = null) => {
    setImageFile(null);
    setImagePreview(item?.image || '');
    baseOpenModal(item);
  };

  // Custom close modal to reset file state
  const handleCloseModal = () => {
    setImageFile(null);
    setImagePreview('');
    baseCloseModal();
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const onExport = () => {
    handleExport(
      "locations_export.csv",
      ["ID", "Name", "City", "Country", "Projects", "Units"],
      l => [
        l.id || l._id, 
        `"${l.name}"`, 
        l.city, 
        l.country, 
        l.projectsCount || l.projects?.length || 0,
        l.unitsCount || l.units?.length || 0
      ].join(",")
    );
  };

  // Custom submit using uploadService
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build FormData for multipart/form-data request
      const formDataObj = new FormData();
      
      // Basic Text Fields
      formDataObj.append('name', formData.name || '');
      formDataObj.append('city', formData.city || '');
      formDataObj.append('country', formData.country || '');
      formDataObj.append('description', formData.description || '');
      formDataObj.append('slug', formData.slug || (formData.name ? generateSlug(formData.name) : ''));
      
      if (formData.lat) formDataObj.append('coordinates[lat]', formData.lat);
      if (formData.lng) formDataObj.append('coordinates[lng]', formData.lng);
      
      // Arrays (Project IDs)
      // JSON.stringify projectIds so backend can parse it back
      if (formData.projectIds && formData.projectIds.length > 0) {
          formDataObj.append('projectIds', JSON.stringify(formData.projectIds));
      }

      // Image Handling
      // If a new file is selected, append it as 'image'
      if (imageFile) {
          formDataObj.append('image', imageFile); 
      } else if (formData.image) {
           // If existing image string (not changed), we might pass it as well if backend expects it, 
           // BUT backend logic often ignores text in 'image' if looking for file.
           // However, locationsService.saveLocation (which calls patch/post) needs to send something?
           // Actually, if we use the backend 'interceptor', it looks for a file.
           // If we don't send a file, the interceptor does nothing.
           // BUT LocationsController.update checks: if (file) updateDto.image = file.filename
           // If we don't send a file, we want to KEEP the old image.
           // We should NOT send 'image' field if it's just the old string URL, 
           // unless backend explicitly handles string URL in that field.
           // Looking at controller: createLocationDto.image = file.filename (IF file exists)
           // It does NOT seem to overwrite image if file is missing, provided we pass the other fields.
           // However, if we preserve the 'image' string in the body, it might be safe.
           // Let's safe-guard: send it only if it's needed or if backend model needs it.
           // Controller logic: "if (file) ...". It doesn't clear image if file is missing.
           // So we can skip appending 'image' if it's just a string, OR append it if we want to be safe.
           // Let's append it to be safe, but creating a FormData key 'image' with string value is fine.
           // WAIT! The Update DTO might have an image property.
           formDataObj.append('image', formData.image);
      }
      
      // Save (create or update)
      if (editingItem) {
        await locationsService.updateLocation(editingItem._id || editingItem.id, formDataObj);
      } else {
        await locationsService.createLocation(formDataObj);
      }
      
      handleCloseModal();
      refresh();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('Locations')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('Add Location')}
          </Button>
        </div>
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
                <div key={location._id} className="glass-panel overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
                <div className="h-48 bg-gray-800 relative">
                    <EntityImage 
                      src={location.image} 
                      alt={location.name} 
                      type="location"
                      className="w-full h-full object-cover" 
                    />
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
                        <div className="text-lg font-bold text-textDark dark:text-white">{location.projectsCount || location.projects?.length || location.stats?.projectsCount || 0}</div>
                        <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('Projects')}</div>
                    </div>
                    <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                        <div className="flex items-center justify-center text-green-400 mb-1"><Home size={16} /></div>
                        <div className="text-lg font-bold text-textDark dark:text-white">{location.unitsCount || location.units?.length || location.stats?.unitsCount || 0}</div>
                        <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('Units')}</div>
                    </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/10 dark:border-white/5">
                    <div className="flex items-center text-sm text-textLight dark:text-gray-400">
                        <MapPin size={14} className="me-2" />
                        {location.lat?.toString().slice(0,6)}, {location.lng?.toString().slice(0,6)}
                    </div>
                    <div className="flex space-x-2">
                        <Link 
                        to={`/projects?location=${location._id}`}
                        target="_blank"
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title={t('View Projects')}
                        >
                        <ExternalLink size={16} />
                        </Link>
                        <button 
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        onClick={() => handleOpenModal(location)}
                        title="Edit"
                        >
                        <Edit size={16} />
                        </button>
                        <button 
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        onClick={() => handleDelete(location._id)}
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
                            <tr key={location._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                            <EntityImage 
                                              src={location.image} 
                                              alt={location.name} 
                                              type="location"
                                              className="w-full h-full object-cover" 
                                            />
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
                                        {location.projectsCount || location.projects?.length || location.stats?.projectsCount || 0}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="inline-block px-2 py-1 rounded-md bg-green-500/10 text-green-500 font-bold text-sm">
                                        {location.unitsCount || location.units?.length || location.stats?.unitsCount || 0}
                                    </span>
                                </td>
                                <td className="p-4 text-center text-xs text-mono text-textLight dark:text-gray-500">
                                    {location.lat?.toString().slice(0,6)}, {location.lng?.toString().slice(0,6)}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <Link 
                                            to={`/projects?location=${location._id}`}
                                            target="_blank"
                                            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                            title={t('View Projects')}
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        <button 
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            onClick={() => handleOpenModal(location)}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(location._id)}
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
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('Image')}</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border/30 dark:border-white/20 bg-background dark:bg-white/5 text-textDark dark:text-white cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-400">{imageFile ? imageFile.name : t('Choose file...')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {(imagePreview || formData.image) && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      <img src={imagePreview || formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
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

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('Assign Projects')}</label>
            <select
              multiple
              value={formData.projectIds || []}
              onChange={(e) => setFormData({ ...formData, projectIds: Array.from(e.target.selectedOptions, opt => opt.value) })}
              className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary min-h-[100px]"
            >
              {projects.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('Hold Ctrl/Cmd to select multiple projects')}</p>
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
