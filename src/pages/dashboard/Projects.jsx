import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import ImageUpload from '../../components/shared/ImageUpload';
import { api } from '../../utils/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'active',
    priceMin: '',
    priceMax: '',
    image: null
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setLoading(true);
    api.getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const newProject = {
      ...formData,
      ...formData,
      slug: formData.name.toLowerCase().replace(/ /g, '-'),
      images: formData.image ? [formData.image] : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"], 
      stats: { totalUnits: 0, available: 0, sold: 0 },
      amenities: [],
      deliveryDate: "2026-01-01",
      priceRange: { min: parseInt(formData.priceMin), max: parseInt(formData.priceMax) },
      developer: { id: 1, name: "Premium Developers" },
      phases: []
    };
    
    await api.createProject(newProject);
    setIsModalOpen(false);
    loadProjects();
    setFormData({ name: '', address: '', status: 'active', priceMin: '', priceMax: '', image: null });
  };

  const handleAddPhase = async (projectId) => {
    const name = prompt("Enter Phase Name:");
    if (!name) return;
    
    await api.createPhase(projectId, { 
      name, 
      deliveryDate: "2026-01-01", // Default for MVP
      status: "planned" 
    });
    loadProjects(); // Reload to see new phase
  };

  const handleDeletePhase = async (projectId, phaseId) => {
    if(window.confirm("Delete this phase?")) {
      await api.deletePhase(projectId, phaseId);
      loadProjects();
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [expandedProject, setExpandedProject] = useState(null);

  const toggleExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" /> Add Project
        </Button>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : filteredProjects.map((project) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                      <div className="text-xs text-gray-400">ID: {project.id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{project.address}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {project.stats.totalUnits} Total
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                          onClick={() => toggleExpand(project.id)}
                          title="Manage Phases & Blocks"
                        >
                          <Search size={18} />
                        </button>
                        <button 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          onClick={() => alert(`Edit project: ${project.name}`)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          onClick={async () => {
                            if(window.confirm(`Are you sure you want to delete ${project.name}?`)) {
                              try {
                                await api.deleteProject(project.id);
                                setProjects(projects.filter(p => p.id !== project.id));
                              } catch (error) {
                                console.error('Error deleting project:', error);
                                alert('Failed to delete project');
                              }
                            }
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProject === project.id && (
                    <tr className="bg-white/5">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="pl-4 border-l-2 border-primary">
                          <h3 className="text-lg font-bold text-white mb-2">Phases</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {project.phases && project.phases.map(phase => (
                              <div key={phase.id} className="bg-dark-card p-3 rounded border border-white/10">
                                <div className="flex justify-between items-start">
                                  <div className="font-bold text-white">{phase.name}</div>
                                  <button onClick={() => handleDeletePhase(project.id, phase.id)} className="text-red-500 hover:text-red-400">
                                    <Trash size={14} />
                                  </button>
                                </div>
                                <div className="text-xs text-gray-400">Delivery: {phase.deliveryDate}</div>
                              </div>
                            ))}
                            <button 
                              onClick={() => handleAddPhase(project.id)}
                              className="flex items-center justify-center p-3 rounded border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                            >
                              <Plus size={16} className="mr-2" /> Add Phase
                            </button>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white mb-2">Blocks</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Blocks would be fetched here based on project ID */}
                            <div className="text-gray-400 text-sm italic">Blocks management coming soon...</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Project Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Address" 
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Image</label>
            <ImageUpload 
              onUpload={(url) => setFormData({...formData, image: url})}
              initialImage={formData.image}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Min Price" 
              type="number"
              value={formData.priceMin}
              onChange={(e) => setFormData({...formData, priceMin: e.target.value})}
              required
            />
            <Input 
              label="Max Price" 
              type="number"
              value={formData.priceMax}
              onChange={(e) => setFormData({...formData, priceMax: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
