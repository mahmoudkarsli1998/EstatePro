import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download, Globe, MapPin, Calendar, FileText } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { estateService } from '../../services/estateService';
import { uploadService } from '../../services/uploadService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import EntityImage from '../../components/shared/EntityImage';

const Developers = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = React.useState([]);

  React.useEffect(() => {
    estateService.getProjects().then(setProjects).catch(console.error);
  }, []);

  const {
    filteredItems: developers,
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
    handleDelete,
    handleExport
  } = useDashboardCrud(
    estateService.getDevelopers,
    estateService.createDeveloper,
    estateService.updateDeveloper, 
    estateService.deleteDeveloper,
    { 
        name: '', 
        description: '', 
        logo: '', 
        contactEmail: '', 
        contactPhone: '', 
        address: '', 
        website: '', 
        established: '' 
    },
    (dev, term) => (dev.name || '').toLowerCase().includes(term.toLowerCase())
  );

  const onExport = () => {
    handleExport(
      "developers_export.csv",
      ["ID", "Name", "Email", "Phone", "Website", "Established"],
      d => [d.id || d._id, `"${d.name}"`, d.contactEmail, d.contactPhone, d.website, d.established].join(",")
    );
  };

  // State for logo upload
  const [logoPreview, setLogoPreview] = React.useState(null);
  const [logoFile, setLogoFile] = React.useState(null);

  // Handle file change for logo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Wrapper to handle modal open with logo preview reset
  const handleOpenModalWrapped = (item = null) => {
    setLogoPreview(item?.logo || null);
    setLogoFile(null);
    handleOpenModal(item);
  };

  // Wrapper for form submit with logo upload
  const handleSubmitWrapped = async (e) => {
    e.preventDefault();
    let finalFormData = { ...formData };
    
    // Upload logo if new file selected
    if (logoFile) {
      try {
        const uploadedFilename = await uploadService.uploadImage(logoFile);
        finalFormData.logo = uploadedFilename;
      } catch (error) {
        console.error('Logo upload failed:', error);
      }
    }
    
    // Use the original submit with modified data
    handleInputChange({ target: { name: 'logo', value: finalFormData.logo } });
    handleSubmit(e);
  };
  
  const getDevProjects = (dev) => {
      const devId = dev.id || dev._id;
      if (!dev && !devId) return [];

      return projects.filter(p => {
          let pDev = p.developer;
          
          // 1. If project developer is an object, try to use its ID or Name
          if (pDev && typeof pDev === 'object') {
              // Priority: ID > _id > Name
              const pDevId = pDev.id || pDev._id || pDev.developerId;
              if (pDevId && devId && (String(pDevId) === String(devId))) return true;
              
              // If object has name, check it too
              if (pDev.name && dev.name && pDev.name.toLowerCase() === dev.name.toLowerCase()) return true;
              
              return false;
          }

          // 2. If project developer is a primitive (string/number)
          const pDevStr = String(pDev);
          const devIdStr = String(devId);
          
          // Check if it matches ID
          if (devId && pDevStr === devIdStr) return true;
          
          // Check if it matches Name (case-insensitive)
          // The user provided dump showed "developer": "MA", which might be a name or code.
          if (dev.name && pDevStr.toLowerCase() === dev.name.toLowerCase()) return true;

          return false;
      });
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('developers')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModalWrapped()}>
            <Plus size={20} className="me-2" /> {t('addDeveloper')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20">
          <div className="relative max-w-md">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-textLight dark:text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchDevelopers')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="text-center col-span-full text-gray-400">{t('loading')}</div>
          ) : developers.length === 0 ? (
            <div className="text-center col-span-full text-gray-400">{t('noDevelopersFound')}</div>
          ) : developers.map((dev) => {
            const devProjs = getDevProjects(dev);
            return (
            <div key={dev.id || dev._id} className="glass-panel p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors group bg-background dark:bg-white/5 border border-border/10 dark:border-white/10">
              <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden border-2 border-border/20 group-hover:border-primary/50 transition-colors">
                <EntityImage 
                    src={dev.logo} 
                    alt={dev.name} 
                    type="developer"
                    className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-lg font-bold text-textDark dark:text-white mb-1">{dev.name}</h3>
              <p className="text-sm text-textLight dark:text-gray-400 mb-2">{dev.contactEmail}</p>
              
              {dev.website && (
                  <a href={dev.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mb-4 flex items-center justify-center gap-1">
                      <Globe size={12} /> {dev.website.replace(/^https?:\/\//, '')}
                  </a>
              )}
              
              <div className="w-full mt-2 mb-4">
                 <p className="text-xs font-semibold text-textLight mb-1">{t('assignedProjects')}</p>
                 {devProjs.length > 0 ? (
                     <div className="flex flex-wrap gap-1 justify-center">
                         {devProjs.slice(0, 3).map((p, idx) => (
                             <span key={p.id || p._id || `proj-${idx}`} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.name}</span>
                         ))}
                         {devProjs.length > 3 && <span className="text-[10px] text-gray-400">+{devProjs.length - 3}</span>}
                     </div>
                 ) : (
                     <span className="text-xs text-gray-400 italic">No projects assigned</span>
                 )}
              </div>

              <div className="flex items-center justify-center space-x-4 w-full mt-auto pt-4 border-t border-border/10 dark:border-white/5">
                <div className="text-xs text-textLight dark:text-gray-500">
                  <span className="block font-bold text-textDark dark:text-white">{devProjs.length}</span> {t('projects')}
                </div>
                <div className="flex gap-2 ms-auto">
                  <button 
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    onClick={() => handleOpenModalWrapped(dev)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={() => handleDelete(dev.id || dev._id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? t('editDeveloper') : t('addDeveloper')}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitWrapped} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label={t('developerName')} 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
               <Input 
                label={t('established', 'Established Year')} 
                name="established"
                value={formData.established}
                onChange={handleInputChange}
                placeholder="e.g. 1997"
              />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('description')}</label>
            <textarea 
                className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Developer description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label={t('contactEmail')} 
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
            />
            <Input 
                label={t('contactPhone')} 
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
            />
          </div>

          <Input 
            label={t('address')} 
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Headquarters address"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input 
                label={t('website')} 
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                icon={Globe}
             />
              {/* File Upload Replacement */}
              <div>
                <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('logo')}</label>
                <div className="flex items-center gap-3">
                   {logoPreview && (
                       <div className="w-12 h-12 rounded-full overflow-hidden border border-border/20">
                           <img src={logoPreview} className="w-full h-full object-cover" alt="Preview"/>
                       </div>
                   )}
                   <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500" />
                </div>
              </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/10 mt-6">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateDeveloper') : t('createDeveloper', 'Create Developer')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Developers;
