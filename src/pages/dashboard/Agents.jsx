import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Mail, Phone, Download, FolderPlus } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { crmService } from '../../services/crmService';
import { estateService } from '../../services/estateService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { uploadService } from '../../services/uploadService';
import EntityImage from '../../components/shared/EntityImage';

const Agents = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { format } = useCurrency();
  const {
    filteredItems: agents,
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
    setFormData, // Exposed from hook
    refresh // For real-time updates without page reload
  } = useDashboardCrud(
    crmService.getAgents,
    (data) => crmService.createAgent({
      ...data,
      totalSales: Number(data.totalSales),
      rating: Number(data.rating),
      activeListingsCount: Number(data.activeListingsCount)
    }),
    (id, data) => crmService.updateAgent(id, {
      ...data,
      totalSales: Number(data.totalSales),
      rating: Number(data.rating),
      activeListingsCount: Number(data.activeListingsCount)
    }),
    crmService.deleteAgent,
    { userId: '', name: '', email: '', phone: '', avatar: 'https://i.pravatar.cc/150?img=1', jobTitle: '', about: '', totalSales: '', rating: '', activeListingsCount: '', recentPerformance: [] },
    (agent, term) => 
      agent.name.toLowerCase().includes(term.toLowerCase()) || 
      agent.email.toLowerCase().includes(term.toLowerCase())
  );

  // File state
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState('');

  // Custom open modal to reset file state
  const handleOpenModalWrapped = (item = null) => {
    setAvatarFile(null);
    setAvatarPreview(item?.avatar || '');
    handleOpenModal(item);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Custom submit
  const handleSubmitWrapped = async (e) => {
      e.preventDefault();
      try {
          let finalAvatar = formData.avatar;
          
          if (avatarFile) {
             const result = await uploadService.uploadFile(avatarFile);
             finalAvatar = result.url || result;
          }
          
          const payload = {
                ...formData,
                avatar: finalAvatar,
                totalSales: Number(formData.totalSales),
                rating: Number(formData.rating),
                activeListingsCount: Number(formData.activeListingsCount)
          };
          
          const agentId = editingItem?.id || editingItem?._id;
          if (editingItem && agentId) {
              await crmService.updateAgent(agentId, payload);
          } else {
              await crmService.createAgent(payload);
          }
          
          handleCloseModal();
          refresh(); // Real-time update instead of page reload
      } catch (err) {
          console.error(err);
          toast.error("Failed to save agent");
      }
  };

  const [selectedAgent, setSelectedAgent] = useState(null);

  const onExport = () => {
    handleExport(
      "agents_export.csv",
      ["ID", "Name", "Email", "Phone", "Projects Count", "Rating"],
      a => [a.id, `"${a.name}"`, a.email, a.phone, a.assignedProjects?.length || 0, 4.9].join(",")
    );
  };

  // Fetch users for the dropdown
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    crmService.getUsers().then(res => setUsers(res)).catch(console.error);
  }, []);

  // Project Assignment Logic
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [assigningAgent, setAssigningAgent] = useState(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  const handleOpenAssignModal = async (agent) => {
      setAssigningAgent(agent);
      setIsLoadingAssignments(true); 
      try {
          // Fetch all projects if not loaded
          if (allProjects.length === 0) {
              const projects = await estateService.getProjects();
              setAllProjects(projects);
          }
          
          // Pre-select currently assigned projects
          // Assuming agent.assignedProjects is array of objects { id, name } or just IDs
          const currentIds = agent.assignedProjects 
              ? agent.assignedProjects.map(p => typeof p === 'object' ? (p.id || p._id) : p)
              : [];
          
          setSelectedProjectIds(currentIds.map(String)); // Normalize to strings
          setAssignModalOpen(true);
      } catch (err) {
          console.error("Failed to load projects", err);
      } finally {
          setIsLoadingAssignments(false);
      }
  };

  const toggleProjectSelection = (projectId) => {
      const idStr = String(projectId);
      setSelectedProjectIds(prev => 
          prev.includes(idStr) 
              ? prev.filter(id => id !== idStr)
              : [...prev, idStr]
      );
  };

  const handleSaveAssignments = async () => {
     if (!assigningAgent) return;
     
     try {
         const agentId = assigningAgent.id || assigningAgent._id;
         await crmService.assignProjectsToAgent(agentId, selectedProjectIds);
         setAssignModalOpen(false);
         refresh(); // Real-time update instead of page reload
     } catch (err) {
         console.error("Failed to assign projects", err);
         toast.error("Failed to assign projects");
     }
  };

  // Performance Form Logic
  const handleAddPerformance = () => {
    const current = formData.recentPerformance || [];
    setFormData(prev => ({
        ...prev,
        recentPerformance: [...current, { title: '', date: new Date().toISOString().split('T')[0], amount: '' }]
    }));
  };

  const handleRemovePerformance = (index) => {
    const current = formData.recentPerformance || [];
    setFormData(prev => ({
        ...prev,
        recentPerformance: current.filter((_, i) => i !== index)
    }));
  };

  const handlePerformanceChange = (index, field, value) => {
    const current = [...(formData.recentPerformance || [])];
    current[index] = { ...current[index], [field]: value };
    setFormData(prev => ({ ...prev, recentPerformance: current }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('agents')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModalWrapped()}>
            <Plus size={20} className="me-2" /> {t('addAgent')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20">
          <div className="relative max-w-md">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchAgents')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="text-center col-span-full text-gray-400">{t('loading')}</div>
          ) : agents.length === 0 ? (
            <div className="text-center col-span-full text-gray-400">{t('noAgentsFound')}</div>
          ) : agents.map((agent) => (
            <div key={agent.id} className="glass-panel p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                <EntityImage 
                    src={agent.avatar} 
                    alt={agent.name} 
                    type="default" 
                    className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{agent.name}</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center">
                <Mail size={14} className="me-1" /> {agent.email}
              </div>
              <div className="text-sm text-gray-400 mb-4 flex items-center justify-center">
                <Phone size={14} className="me-1" /> {agent.phone}
              </div>
              
              <div className="w-full mt-auto pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-3">
                     <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-900 dark:text-white">{agent.assignedProjects?.length || 0}</span> {t('projects')}
                     </div>
                </div>

                <div className="flex justify-center space-x-2">
                  <button 
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setSelectedAgent(agent)}
                    title={t('viewProfile')}
                  >
                    <Search size={16} />
                  </button>
                  <button 
                    className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    onClick={() => handleOpenAssignModal(agent)}
                    title={t('manageProjects')}
                  >
                    <FolderPlus size={16} />
                  </button>
                  <button 
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    onClick={() => handleOpenModalWrapped(agent)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={() => handleDelete(agent.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? t('editAgent') : t('addNewAgent')}
      >
        <form onSubmit={handleSubmitWrapped} className="space-y-4">
          {!editingItem && (
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('linkUser')}</label>
               <select 
                 name="userId" 
                 value={formData.userId || ''} 
                 onChange={handleInputChange}
                 className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white transition-colors"
                 required
               >
                 <option value="" className="text-textDark bg-white dark:bg-gray-800 dark:text-white">Select a system user...</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id} className="text-textDark bg-white dark:bg-gray-800 dark:text-white">{u.name} ({u.email})</option>
                 ))}
               </select>
            </div>
          )}
          <Input 
            label={t('agentName')} 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input 
            label={t('email')} 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input 
            label={t('phone')} 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          
          {/* File Upload Replacement */}
          <div>
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('avatar')}</label>
            <div className="flex items-center gap-3">
               {avatarPreview && (
                   <div className="w-12 h-12 rounded-full overflow-hidden border border-border/20">
                       <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview"/>
                   </div>
               )}
               <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500" />
            </div>
          </div>
          <Input 
            label={t('jobTitle', 'Job Title')} 
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-3 gap-4">
             <Input 
                label={t('totalSales', 'Total Sales ($)')} 
                name="totalSales"
                type="number"
                value={formData.totalSales}
                onChange={handleInputChange}
             />
             <Input 
                label={t('rating', 'Rating')} 
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleInputChange}
             />
             <Input 
                label={t('activeListings', 'Active Listings')} 
                name="activeListingsCount"
                type="number"
                value={formData.activeListingsCount}
                onChange={handleInputChange}
             />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-textDark dark:text-white">{t('about', 'About')}</label>
            <textarea
                name="about"
                value={formData.about || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white transition-colors h-24 resize-none"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-border/10">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-textDark dark:text-white">{t('recentPerformance', 'Recent Performance deals')}</label>
                <Button type="button" size="sm" variant="outline" onClick={handleAddPerformance}>
                    <Plus size={14} className="me-1" /> {t('addDeal', 'Add Deal')}
                </Button>
            </div>
            
            {(formData.recentPerformance || []).map((item, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-border/20 dark:border-white/10 relative group">
                    <button 
                        type="button" 
                        onClick={() => handleRemovePerformance(index)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove Deal"
                    >
                        <Trash size={14} />
                    </button>
                    <Input 
                        placeholder="Deal Title (e.g. Sold Penthouse)"
                        value={item.title}
                        onChange={(e) => handlePerformanceChange(index, 'title', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            type="date"
                            value={item.date ? item.date.split('T')[0] : ''}
                            onChange={(e) => handlePerformanceChange(index, 'date', e.target.value)}
                        />
                        <Input 
                            type="number"
                            placeholder="Amount ($)"
                            value={item.amount}
                            onChange={(e) => handlePerformanceChange(index, 'amount', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            {(formData.recentPerformance || []).length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2 italic">{t('noDealsAdded', 'No deals added yet')}</div>
            )}
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateAgent') : t('createAgent')}</Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN PROJECTS MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={t('assignProjectsTo') + " " + (assigningAgent?.name || '')}
        maxWidth="max-w-xl"
      >
          <div className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-2 p-2 border border-gray-200 dark:border-white/10 rounded-lg">
                  {allProjects.map(p => {
                      const pId = String(p.id || p._id);
                      const isSelected = selectedProjectIds.includes(pId);
                      return (
                          <div 
                              key={pId} 
                              onClick={() => toggleProjectSelection(pId)}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-gray-50 dark:bg-white/5 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'
                              }`}
                          >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center me-3 ${
                                  isSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'
                              }`}>
                                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.address}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.status}</div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                  <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>{t('cancel')}</Button>
                  <Button onClick={handleSaveAssignments}>{t('saveAssignments')}</Button>
              </div>
          </div>
      </Modal>

      {/* Agent Profile View Modal */}
      {selectedAgent && (
        <Modal
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          title={t('agentProfile')}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-2 border-primary/50 shrink-0">
                <EntityImage 
                    src={selectedAgent.avatar} 
                    alt={selectedAgent.name} 
                    type="default"
                    className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedAgent.name}</h2>
                <p className="text-primary font-medium mb-3">{selectedAgent.jobTitle || t('seniorAgent')}</p>
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-300">
                  <div className="flex items-center"><Mail size={14} className="me-2 text-gray-400 dark:text-gray-500" /> {selectedAgent.email}</div>
                  <div className="flex items-center"><Phone size={14} className="me-2 text-gray-400 dark:text-gray-500" /> {selectedAgent.phone}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedAgent.totalSales ? format(Number(selectedAgent.totalSales)) : format(0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('totalSales')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {/* Prefer manually set count, fallback to assigned projects count */}
                    {selectedAgent.activeListingsCount || selectedAgent.assignedProjects?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('activeListings')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center border border-gray-200 dark:border-white/10">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedAgent.rating || 'N/A'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('rating')}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('about')}</h3>
              <p className="text-gray-500 dark:text-gray-300 leading-relaxed text-sm">
                {selectedAgent.about || t('agentDescription', 'is a dedicated real estate professional with over 5 years of experience...')}
              </p>
            </div>

            {selectedAgent.recentPerformance && selectedAgent.recentPerformance.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('recentPerformance')}</h3>
                <div className="space-y-3">
                  {selectedAgent.recentPerformance.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold text-sm">+{format(Number(item.amount))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Agents;
