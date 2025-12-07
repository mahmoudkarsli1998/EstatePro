import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, Trash2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Managers = () => {
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const {
    filteredItems: managers,
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
    api.getManagers,
    api.createManager,
    api.updateManager,
    api.deleteManager,
    { name: '', email: '', phone: '', department: '', status: 'active' },
    (manager, term) => {
      const lowerTerm = term.toLowerCase();
      const matchesSearch = 
        manager.name.toLowerCase().includes(lowerTerm) || 
        manager.email.toLowerCase().includes(lowerTerm) ||
        manager.department.toLowerCase().includes(lowerTerm);
      
      const matchesFilter = departmentFilter === 'All Departments' || manager.department === departmentFilter;

      return matchesSearch && matchesFilter;
    }
  );

  const onExport = () => {
    handleExport(
      "managers_export.csv",
      ["ID", "Name", "Email", "Phone", "Department", "Status", "Join Date"],
      m => [m.id, `"${m.name}"`, m.email, m.phone, m.department, m.status, m.joinDate].join(",")
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Managers</h1>
           <p className="text-gray-400 text-sm mt-1">Manage your team leads and department heads</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="mr-2" /> Export
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" /> Add Manager
          </Button>
        </div>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search managers..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-white/5 border border-white/10 rounded-lg text-white px-3 py-2 outline-none text-sm focus:border-primary"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option>All Departments</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>IT</option>
              <option>HR</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : managers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">No managers found</td></tr>
              ) : managers.map((manager) => (
                <tr key={manager.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{manager.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail size={12} className="mr-2 text-gray-500" /> {manager.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone size={12} className="mr-2 text-gray-500" /> {manager.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                        {manager.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={manager.status === 'active' ? 'success' : 'warning'}>
                      {manager.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatDate(manager.joinDate)}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleOpenModal(manager)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(manager.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Edit Manager" : "Add Manager"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input 
            label="Email" 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input 
             label="Phone Number"
             name="phone"
             value={formData.phone}
             onChange={handleInputChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
                <option value="" disabled>Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingItem ? "Update Manager" : "Create Manager"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Managers;
