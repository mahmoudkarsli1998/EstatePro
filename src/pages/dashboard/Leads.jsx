import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [leadsData, agentsData] = await Promise.all([
      api.getLeads(),
      api.getAgents()
    ]);
    setLeads(leadsData);
    setAgents(agentsData);
    setLoading(false);
  };

  const handleAssign = async (agentId) => {
    if (!selectedLead) return;
    
    await api.updateLead(selectedLead.id, { 
      assignedAgentId: parseInt(agentId),
      status: 'contacted' // Auto-update status when assigned
    });
    
    setIsAssignModalOpen(false);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Leads</h1>
        <Button onClick={() => alert('Leads exported to CSV!')}>Export CSV</Button>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Interest</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : leads.map((lead) => {
                const assignedAgent = agents.find(a => a.id === lead.assignedAgentId);
                return (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                      <div className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300 mb-1">
                        <Mail size={14} className="mr-2" /> {lead.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone size={14} className="mr-2" /> {lead.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {lead.unitId ? `Unit ID: ${lead.unitId}` : 'General Inquiry'}
                    </td>
                    <td className="px-6 py-4">
                      {assignedAgent ? (
                        <div className="flex items-center text-sm text-white">
                          <div className="w-6 h-6 rounded-full bg-gray-700 mr-2 overflow-hidden">
                            <img src={assignedAgent.avatar} alt={assignedAgent.name} className="w-full h-full object-cover" />
                          </div>
                          {assignedAgent.name}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        lead.status === 'new' ? 'primary' : 
                        lead.status === 'closed' ? 'success' : 'neutral'
                      }>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                      <button 
                        className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                        onClick={async () => {
                          if(window.confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
                            await api.deleteLead(lead.id);
                            setLeads(leads.filter(l => l.id !== lead.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Agent Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-card border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Assign Agent</h2>
            <p className="text-gray-400 mb-4">Select an agent to assign to <strong>{selectedLead?.name}</strong>.</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors text-left border border-transparent hover:border-primary/30"
                  onClick={() => handleAssign(agent.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 overflow-hidden">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.email}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
