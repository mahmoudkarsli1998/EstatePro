import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, Trash2, Shield } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Admins = () => {
  const { t } = useTranslation();
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
           <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('admins')}</h1>
           <p className="text-gray-400 text-sm mt-1">{t('manageAdmins')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addAdmin')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchAdmins')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
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
              <option value="All Roles">{t('allRoles')}</option>
              <option value="Super Admin">{t('superAdmin')}</option>
              <option value="Support Admin">{t('supportAdmin')}</option>
              <option value="Content Manager">{t('contentManager')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-section/50 text-textLight font-medium text-sm">
              <tr>
                <th className="px-6 py-4 text-start">{t('name')}</th>
                <th className="px-6 py-4 text-start">{t('contact')}</th>
                <th className="px-6 py-4 text-start">{t('role')}</th>
                <th className="px-6 py-4 text-start">{t('status')}</th>
                <th className="px-6 py-4 text-start">{t('lastLogin')}</th>
                <th className="px-6 py-4 text-start">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('loading')}</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('noAdminsFound', 'No admins found')}</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-textDark dark:text-white flex items-center gap-2">
                        {admin.role === 'Super Admin' && <Shield size={14} className="text-primary" />}
                        {admin.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail size={12} className="me-2 text-gray-500" /> {admin.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone size={12} className="me-2 text-gray-500" /> {admin.phone}
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
        title={editingItem ? t('editAdmin') : t('addAdmin')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label={t('fullName')} 
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
             label={t('phoneNumber')}
             name="phone"
             value={formData.phone}
             onChange={handleInputChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('role')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
                <option value="" disabled>{t('selectRole')}</option>
                <option value="Super Admin">{t('superAdmin')}</option>
                <option value="Support Admin">{t('supportAdmin')}</option>
                <option value="Content Manager">{t('contentManager')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('status')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateAdmin', 'Update Admin') : t('createAdmin', 'Create Admin')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admins;
