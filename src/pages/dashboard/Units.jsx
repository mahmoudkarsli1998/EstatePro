import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Filter } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import ImageUpload from '../../components/shared/ImageUpload';
import { api } from '../../utils/api';

const Units = () => {
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    type: 'residential',
    floor: '',
    area_m2: '',
    price: '',
    status: 'available',
    price: '',
    status: 'available',
    projectId: '',
    bedrooms: '',
    bathrooms: '',
    image: null
  });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = () => {
    setLoading(true);
    Promise.all([
      api.getUnits(),
      api.getProjects()
    ]).then(([unitsData, projectsData]) => {
      setUnits(unitsData);
      setProjects(projectsData);
      setLoading(false);
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const newUnit = {
      ...formData,
      price: parseInt(formData.price),
      area_m2: parseInt(formData.area_m2),
      floor: parseInt(formData.floor),
      projectId: parseInt(formData.projectId),
      features: {
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
      },
      images: formData.image ? [formData.image] : ["https://images.unsplash.com/photo-1600596542815-2495db98dada"]
    };
    
    await api.createUnit(newUnit);
    setIsModalOpen(false);
    loadUnits();
    setFormData({ 
      number: '', type: 'residential', floor: '', area_m2: '', 
      price: '', status: 'available', projectId: '', 
      bedrooms: '', bathrooms: '', image: null 
    });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this unit?')) {
      await api.deleteUnit(id);
      loadUnits();
    }
  };

  const filteredUnits = units.filter(u => 
    u.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Units</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" /> Add Unit
        </Button>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <div className="relative max-w-md flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search units..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter size={18} className="mr-2" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4">Area</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{unit.number}</td>
                  <td className="px-6 py-4 capitalize text-gray-300">{unit.type}</td>
                  <td className="px-6 py-4 text-gray-300">{unit.floor}</td>
                  <td className="px-6 py-4 text-gray-300">{unit.area_m2} m²</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${(unit.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      unit.status === 'available' ? 'success' : 
                      unit.status === 'sold' ? 'neutral' : 'warning'
                    }>
                      {unit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={18} />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Unit"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              required
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Unit Number" 
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              required
            />
            <Input 
              label="Floor" 
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Area (m²)" 
              type="number"
              value={formData.area_m2}
              onChange={(e) => setFormData({...formData, area_m2: e.target.value})}
              required
            />
            <Input 
              label="Price ($)" 
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Bedrooms" 
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
              required
            />
            <Input 
              label="Bathrooms" 
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Image</label>
            <ImageUpload 
              onUpload={(url) => setFormData({...formData, image: url})}
              initialImage={formData.image}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Unit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Units;
