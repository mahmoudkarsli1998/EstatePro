import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Developers = () => {
  const { t } = useTranslation();
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
    api.getDevelopers,
    api.createDeveloper,
    api.updateDeveloper, // Assuming this exists or will be added
    api.deleteDeveloper,
    { name: '', contactEmail: '', contactPhone: '', logo: 'https://via.placeholder.com/150' },
    (dev, term) => dev.name.toLowerCase().includes(term.toLowerCase())
  );

  const onExport = () => {
    handleExport(
      "developers_export.csv",
      ["ID", "Name", "Email", "Phone", "Projects Count"],
      d => [d.id, `"${d.name}"`, d.contactEmail, d.contactPhone, d.projects?.length || 0].join(",")
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('developers')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
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
          ) : developers.map((dev) => (
            <div key={dev.id} className="glass-panel p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors group bg-background dark:bg-white/5 border border-border/10 dark:border-white/10">
              <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden border-2 border-border/20 group-hover:border-primary/50 transition-colors">
                <img src={dev.logo} alt={dev.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-textDark dark:text-white mb-1">{dev.name}</h3>
              <p className="text-sm text-textLight dark:text-gray-400 mb-4">{dev.contactEmail}</p>
              
              <div className="flex items-center justify-center space-x-4 w-full mt-auto pt-4 border-t border-border/10 dark:border-white/5">
                <div className="text-xs text-textLight dark:text-gray-500">
                  <span className="block font-bold text-textDark dark:text-white">{dev.projects?.length || 0}</span> {t('projects')}
                </div>
                <div className="flex gap-2 ms-auto">
                  <button 
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    onClick={() => handleOpenModal(dev)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={() => handleDelete(dev.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? t('editDeveloper') : t('addDeveloper')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label={t('developerName')} 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
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
          <Input 
            label={t('logoUrl')} 
            name="logo"
            value={formData.logo}
            onChange={handleInputChange}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateDeveloper') : t('createDeveloper', 'Create Developer')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Developers;
