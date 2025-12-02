import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Building } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import { api } from '../../utils/api';

const Developers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    logo: 'https://via.placeholder.com/150'
  });

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = () => {
    setLoading(true);
    api.getDevelopers().then(data => {
      setDevelopers(data);
      setLoading(false);
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.createDeveloper(formData);
    setIsModalOpen(false);
    loadDevelopers();
    setFormData({ name: '', contactEmail: '', contactPhone: '', logo: 'https://via.placeholder.com/150' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this developer?')) {
      await api.deleteDeveloper(id);
      loadDevelopers();
    }
  };

  const filteredDevelopers = developers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Developers</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" /> Add Developer
        </Button>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search developers..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="text-center col-span-full text-gray-400">Loading...</div>
          ) : filteredDevelopers.map((dev) => (
            <div key={dev.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors group">
              <div className="w-20 h-20 rounded-full bg-gray-800 mb-4 overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                <img src={dev.logo} alt={dev.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{dev.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{dev.contactEmail}</p>
              
              <div className="flex items-center justify-center space-x-4 w-full mt-auto pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500">
                  <span className="block font-bold text-white">{dev.projects.length}</span> Projects
                </div>
                <div className="flex space-x-2 ml-auto">
                  <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        onClose={() => setIsModalOpen(false)} 
        title="Add New Developer"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Developer Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Contact Email" 
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            required
          />
          <Input 
            label="Contact Phone" 
            value={formData.contactPhone}
            onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
            required
          />
          <Input 
            label="Logo URL" 
            value={formData.logo}
            onChange={(e) => setFormData({...formData, logo: e.target.value})}
          />
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Developer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Developers;
