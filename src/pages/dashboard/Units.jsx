import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Filter } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';

const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getUnits().then(data => {
      setUnits(data);
      setLoading(false);
    });
  }, []);

  const filteredUnits = units.filter(u => 
    u.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Units</h1>
        <Button>
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
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
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
    </div>
  );
};

export default Units;
