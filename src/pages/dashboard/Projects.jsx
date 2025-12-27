import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit, Trash, Search, MapPin, Layers, Download, Home, Maximize, LayoutGrid, List } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';

const Projects = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
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
  
  // Auto-open modal if requested via navigation state
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreateModal && !loading) {
       handleOpenModal();
       // Clear state to prevent reopening on refresh (optional, but good practice if using history.replace)
       window.history.replaceState({}, document.title);
    }
  }, [location.state, loading]);

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
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('projects')}</h1>
        <div className="flex gap-3">
           <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addProject')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchProjects')}
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
        ) : projects.length === 0 ? (
             <div className="p-8 text-center text-gray-400">{t('noProjects')}</div>
        ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {projects.map((project) => (
            <div key={project.id} className="glass-panel overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
              <div className="h-48 bg-gray-800 relative">
                <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs text-white uppercase font-bold border border-white/10">
                  {project.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-textDark dark:text-white mb-2">{project.name}</h3>
                <div className="flex items-center text-textLight dark:text-gray-400 mb-4 text-sm">
                  <MapPin size={14} className="me-1" /> {project.address}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                    <div className="text-lg font-bold text-textDark dark:text-white">{project.stats.totalUnits}</div>
                    <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('units')}</div>
                  </div>
                  <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                    <div className="text-lg font-bold text-primary">{project.stats.available}</div>
                    <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('avail')}</div>
                  </div>
                  <div className="bg-primary/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-green-400">{project.stats.sold}</div>
                    <div className="text-[10px] text-textLight uppercase">{t('sold')}</div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/10 dark:border-white/5">
                  <div className="flex items-center text-sm text-textLight dark:text-gray-400">
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
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-textLight dark:text-gray-400 text-sm border-b border-border/20 dark:border-white/10">
                            <th className="p-4 font-medium">{t('Name')}</th>
                            <th className="p-4 font-medium">{t('Location')}</th>
                            <th className="p-4 font-medium text-center">{t('Status')}</th>
                            <th className="p-4 font-medium text-center">{t('Units')}</th>
                            <th className="p-4 font-medium text-center">{t('Sold')}</th>
                            <th className="p-4 font-medium text-center">{t('Phases')}</th>
                            <th className="p-4 font-medium text-end">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 dark:divide-white/5">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                            <img src={project.images[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="font-bold text-textDark dark:text-white">{project.name}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-textDark dark:text-gray-300">
                                    <div className="flex items-center text-sm gap-1">
                                        <MapPin size={14} className="text-gray-400" />
                                        {project.address}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                        project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                        project.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-gray-500/10 text-gray-500'
                                    }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-textDark dark:text-white">{project.stats.totalUnits}</span>
                                        <span className="text-xs text-textLight">{project.stats.available} avail</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-green-500 font-bold">
                                    {project.stats.sold}
                                </td>
                                <td className="p-4 text-center text-textLight text-sm">
                                    <div className="flex items-center justify-center gap-1">
                                         <Layers size={14} /> {project.phases?.length || 0}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            onClick={() => handleOpenModal(project)}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(project.id)}
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
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'phases' ? 'bg-primary/20 text-primary' : 'text-textLight hover:text-primary dark:text-gray-400 dark:hover:text-white'}`}
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
                    <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('description')}</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary h-32 resize-none"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('status')}</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
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
                      <img key={i} src={img} alt="preview" className="w-full h-24 object-cover rounded border border-border/10 dark:border-white/10" />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'phases' && editingItem && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-textDark dark:text-white">Project Phases</h3>
                        <Button type="button" size="sm" onClick={handleAddPhase}>
                            <Plus size={16} className="mr-1" /> Add Phase
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {(!editingItem.phases || editingItem.phases.length === 0) && (
                            <div className="text-gray-500 text-sm italic py-4 text-center">No phases defined.</div>
                        )}
                        {editingItem.phases?.map((phase, idx) => (
                            <div key={idx} className="bg-background dark:bg-white/5 p-3 rounded-lg border border-border/20 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-textDark dark:text-white">{phase.name}</div>
                                    <div className="text-xs text-textLight dark:text-gray-400">{phase.status} • {phase.deliveryDate}</div>
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

                    <div className="mt-8 pt-4 border-t border-border/10 dark:border-white/10">
                        <h3 className="text-lg font-bold text-textDark dark:text-white mb-2">Blocks</h3>
                        <p className="text-sm text-textLight dark:text-gray-400">Blocks management is context-dependent on Phases.</p>
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
