import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Mail, Phone, Download } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Agents = () => {
  const { t } = useTranslation();
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
    handleExport
  } = useDashboardCrud(
    api.getAgents,
    api.createAgent,
    api.updateAgent, // Needs to be added to api.js
    api.deleteAgent,
    { name: '', email: '', phone: '', avatar: 'https://i.pravatar.cc/150?img=1' },
    (agent, term) => 
      agent.name.toLowerCase().includes(term.toLowerCase()) || 
      agent.email.toLowerCase().includes(term.toLowerCase())
  );

  const [selectedAgent, setSelectedAgent] = useState(null);

  const onExport = () => {
    handleExport(
      "agents_export.csv",
      ["ID", "Name", "Email", "Phone", "Projects Count", "Rating"],
      a => [a.id, `"${a.name}"`, a.email, a.phone, a.assignedProjects?.length || 0, 4.9].join(",")
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('agents')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
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
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
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
            <div key={agent.id} className="glass-panel p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors group">
              <div className="w-20 h-20 rounded-full bg-primary/10 mb-4 overflow-hidden border-2 border-border/20 group-hover:border-primary/50 transition-colors">
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
              <div className="text-sm text-gray-400 mb-2 flex items-center justify-center">
                <Mail size={14} className="me-1" /> {agent.email}
              </div>
              <div className="text-sm text-gray-400 mb-4 flex items-center justify-center">
                <Phone size={14} className="me-1" /> {agent.phone}
              </div>
              
              <div className="flex items-center justify-center space-x-4 w-full mt-auto pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500">
                  <span className="block font-bold text-white">{agent.assignedProjects?.length || 0}</span> {t('projects')}
                </div>
                <div className="flex space-x-2 ms-auto">
                  <button 
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setSelectedAgent(agent)}
                    title="View Profile"
                  >
                    <Search size={16} />
                  </button>
                  <button 
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    onClick={() => handleOpenModal(agent)}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? t('editAgent') : t('addNewAgent')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input 
            label={t('avatarUrl')} 
            name="avatar"
            value={formData.avatar}
            onChange={handleInputChange}
          />
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateAgent') : t('createAgent')}</Button>
          </div>
        </form>
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
                <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedAgent.name}</h2>
                <p className="text-primary font-medium mb-3">{t('seniorAgent')}</p>
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex items-center"><Mail size={14} className="me-2 text-gray-500" /> {selectedAgent.email}</div>
                  <div className="flex items-center"><Phone size={14} className="me-2 text-gray-500" /> {selectedAgent.phone}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">$4.2M</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{t('totalSales')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">{selectedAgent.assignedProjects?.length || 12}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{t('activeListings')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">4.9</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{t('rating')}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3">{t('about')}</h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                {selectedAgent.name} {t('agentDescription', 'is a dedicated real estate professional with over 5 years of experience...')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3">{t('recentPerformance')}</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <div className="text-white font-medium text-sm">Sold Penthouse at Ocean View</div>
                      <div className="text-xs text-gray-500">2 days ago</div>
                    </div>
                    <div className="text-green-400 font-bold text-sm">+$450,000</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Agents;
