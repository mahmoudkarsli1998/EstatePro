import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, MapPin, Layers, Download, Home, Maximize } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';

const Projects = () => {
  const { t } = useTranslation();
  const {
    filteredItems: projects,
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
    handleExport,
    refresh
  } = useDashboardCrud(
    api.getProjects,
    api.createProject,
    api.updateProject,
    api.deleteProject,
    { 
      name: '', 
      address: '', 
      description: '', 
      status: 'active',
      images: [],
      stats: { totalUnits: 0, available: 0, sold: 0 }
    },
    (proj, term) => proj.name.toLowerCase().includes(term.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState('details');

  const onExport = () => {
    handleExport(
      "projects_export.csv",
      ["ID", "Name", "Location", "Status", "Units", "Available"],
      p => [p.id, `"${p.name}"`, `"${p.address}"`, p.status, p.stats.totalUnits, p.stats.available].join(",")
    );
  };

  const handleModalCloseWrapper = () => {
    setActiveTab('details');
    handleCloseModal();
  };

  // Phase Management Logic
  const handleAddPhase = async () => {
    const name = prompt("Enter Phase Name:");
    if (!name || !editingItem) return;
    
    await api.createPhase(editingItem.id, { 
      name, 
      deliveryDate: "2026-01-01", 
      status: "planned" 
    });
    refresh(); 
    // Note: In a real app we'd update local state to avoid full reload or re-fetch just this project
  };

  const handleDeletePhase = async (phaseId) => {
    if(!editingItem || !window.confirm("Delete this phase?")) return;
    await api.deletePhase(editingItem.id, phaseId);
    refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{t('projects')}</h1>
        <div className="flex gap-3">
           <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addProject')}
          </Button>
        </div>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchProjects')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="text-center col-span-full text-gray-400">{t('loading')}</div>
          ) : projects.length === 0 ? (
            <div className="text-center col-span-full text-gray-400">{t('noProjects')}</div>
          ) : projects.map((project) => (
            <div key={project.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
              <div className="h-48 bg-gray-800 relative">
                <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs text-white uppercase font-bold border border-white/10">
                  {project.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <div className="flex items-center text-gray-400 mb-4 text-sm">
                  <MapPin size={14} className="me-1" /> {project.address}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-white">{project.stats.totalUnits}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{t('units')}</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-primary">{project.stats.available}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{t('avail')}</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-green-400">{project.stats.sold}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{t('sold')}</div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center text-sm text-gray-400">
                    <Layers size={14} className="me-2" />
                    {project.phases?.length || 0} {t('phases')}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      onClick={() => handleOpenModal(project)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      onClick={() => handleDelete(project.id)}
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
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleModalCloseWrapper} 
        title={editingItem ? `${t('edit')}: ${editingItem.name}` : t('createProject')}
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 space-y-1">
            <button 
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('details')}
            >
              <Home size={16} className="inline me-2" /> {t('details')}
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'images' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('images')}
            >
              <Maximize size={16} className="inline me-2" /> {t('images')}
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'phases' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('phases')}
              disabled={!editingItem} // Disable for new projects until created
            >
              <Layers size={16} className="inline me-2" /> {t('phases')}
            </button>
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'details' && (
                <>
                  <Input 
                    label={t('projectName')} 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Input 
                    label={t('address')} 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('description')}</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary h-32 resize-none"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('status')}</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">{t('active')}</option>
                      <option value="upcoming">{t('upcoming')}</option>
                      <option value="completed">{t('completed')}</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'images' && (
                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
                  <div className="text-gray-400 mb-2">Image upload simulation</div>
                   <div className="text-xs text-gray-500 mb-4">(Images are currently read-only mock data)</div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {formData.images?.map((img, i) => (
                      <img key={i} src={img} alt="preview" className="w-full h-24 object-cover rounded border border-white/10" />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'phases' && editingItem && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Project Phases</h3>
                        <Button type="button" size="sm" onClick={handleAddPhase}>
                            <Plus size={16} className="mr-1" /> Add Phase
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {(!editingItem.phases || editingItem.phases.length === 0) && (
                            <div className="text-gray-500 text-sm italic py-4 text-center">No phases defined.</div>
                        )}
                        {editingItem.phases?.map((phase, idx) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white">{phase.name}</div>
                                    <div className="text-xs text-gray-400">{phase.status} • {phase.deliveryDate}</div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => handleDeletePhase(phase.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors bg-transparent p-1"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10">
                        <h3 className="text-lg font-bold text-white mb-2">Blocks</h3>
                        <p className="text-sm text-gray-400">Blocks management is context-dependent on Phases.</p>
                    </div>
                 </div>
              )}

              {/* Only show 'Save' button on Details tab to avoid confusion, or assume instant save for others */}
              {activeTab === 'details' && (
                <div className="pt-6 flex justify-end space-x-3 border-t border-white/5 mt-4">
                    <Button type="button" variant="ghost" onClick={handleModalCloseWrapper}>{t('cancel')}</Button>
                    <Button type="submit">{editingItem ? t('saveDetails') : t('createProject')}</Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
