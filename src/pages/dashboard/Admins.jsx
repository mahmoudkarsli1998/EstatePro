import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, Trash2, Shield } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Admins = () => {
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const {
    filteredItems: admins,
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
    api.getAdmins,
    api.createAdmin,
    api.updateAdmin,
    api.deleteAdmin,
    { name: '', email: '', phone: '', role: 'Support Admin', status: 'active' },
    (admin, term) => {
      const lowerTerm = term.toLowerCase();
      const matchesSearch = 
        admin.name.toLowerCase().includes(lowerTerm) || 
        admin.email.toLowerCase().includes(lowerTerm) ||
        admin.role.toLowerCase().includes(lowerTerm);
      
      const matchesFilter = roleFilter === 'All Roles' || admin.role === roleFilter;

      return matchesSearch && matchesFilter;
    }
  );

  const onExport = () => {
    handleExport(
      "admins_export.csv",
      ["ID", "Name", "Email", "Phone", "Role", "Status", "Last Login"],
      a => [a.id, `"${a.name}"`, a.email, a.phone, a.role, a.status, a.lastLogin || 'Never'].join(",")
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Admins</h1>
           <p className="text-gray-400 text-sm mt-1">Manage system administrators and access levels</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="mr-2" /> Export
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" /> Add Admin
          </Button>
        </div>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search admins..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-white/5 border border-white/10 rounded-lg text-white px-3 py-2 outline-none text-sm focus:border-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Support Admin</option>
              <option>Content Manager</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">No admins found</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {admin.role === 'Super Admin' && <Shield size={14} className="text-primary" />}
                        {admin.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail size={12} className="mr-2 text-gray-500" /> {admin.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone size={12} className="mr-2 text-gray-500" /> {admin.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs text-gray-300 ${admin.role === 'Super Admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/10'}`}>
                        {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={admin.status === 'active' ? 'success' : 'warning'}>
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatDate(admin.lastLogin)}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleOpenModal(admin)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(admin.id)}
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
        title={editingItem ? "Edit Admin" : "Add Admin"}
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
                <option value="" disabled>Select Role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Support Admin">Support Admin</option>
                <option value="Content Manager">Content Manager</option>
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
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingItem ? "Update Admin" : "Create Admin"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admins;
