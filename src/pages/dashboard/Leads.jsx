import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
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
                    <Badge variant={
                      lead.status === 'new' ? 'primary' : 
                      lead.status === 'closed' ? 'success' : 'neutral'
                    }>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => alert(`Viewing details for ${lead.name}`)}>View</Button>
                    <button 
                      className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                      onClick={async () => {
                        if(window.confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
                          try {
                            await api.deleteLead(lead.id);
                            setLeads(leads.filter(l => l.id !== lead.id));
                          } catch (error) {
                            console.error('Error deleting lead:', error);
                            alert('Failed to delete lead');
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
