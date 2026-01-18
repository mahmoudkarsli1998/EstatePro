import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, Trash2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { crmService } from '../../services/crmService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Managers = () => {
  const { t } = useTranslation();
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
    crmService.getManagers,
    crmService.createManager,
    crmService.updateManager,
    crmService.deleteManager,
    { name: '', email: '', phone: '', department: '', status: 'active' },
    (manager, term) => {
      const lowerTerm = term.toLowerCase();
      const matchesSearch = 
        (manager.name || manager.fullName || '').toLowerCase().includes(lowerTerm) || 
        (manager.email || '').toLowerCase().includes(lowerTerm) ||
        (manager.department || '').toLowerCase().includes(lowerTerm);
      
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
           <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('managers')}</h1>
           <p className="text-gray-400 text-sm mt-1">{t('manageManagers')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addManager')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchManagers')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 rounded-lg text-textDark dark:text-white px-3 py-2 outline-none text-sm focus:border-primary"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">{t('allDepartments')}</option>
              <option value="Sales">{t('sales')}</option>
              <option value="Marketing">{t('marketing')}</option>
              <option value="IT">{t('it')}</option>
              <option value="HR">{t('hr')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-section/50 text-textLight font-medium text-sm">
              <tr>
                <th className="px-6 py-4 text-start">{t('name')}</th>
                <th className="px-6 py-4 text-start">{t('contact')}</th>
                <th className="px-6 py-4 text-start">{t('department')}</th>
                <th className="px-6 py-4 text-start">{t('status')}</th>
                <th className="px-6 py-4 text-start">{t('joinDate', 'Join Date')}</th>
                <th className="px-6 py-4 text-start">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('loading')}</td></tr>
              ) : managers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('noManagersFound')}</td></tr>
              ) : managers.map((manager) => (
                <tr key={manager.id || manager._id} className="hover:bg-section dark:hover:bg-white/5 transition-colors border-b border-border/10 dark:border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium text-textDark dark:text-white">{manager.name || manager.fullName || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-textLight dark:text-gray-300">
                        <Mail size={12} className="me-2 text-gray-500" /> {manager.email || '-'}
                      </div>
                      <div className="flex items-center text-sm text-textLight dark:text-gray-300">
                        <Phone size={12} className="me-2 text-gray-500" /> {manager.phone || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-background dark:bg-white/10 px-2 py-1 rounded text-xs text-textLight dark:text-gray-300 border border-border/20 dark:border-transparent">
                        {manager.department || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={manager.status === 'active' ? 'success' : 'warning'}>
                      {manager.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-textLight dark:text-gray-300 text-sm">
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
        title={editingItem ? t('editManager') : t('addManager')}
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
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('department')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
                <option value="" disabled>{t('department')}</option>
                <option value="Sales">{t('sales')}</option>
                <option value="Marketing">{t('marketing')}</option>
                <option value="IT">{t('it')}</option>
                <option value="HR">{t('hr')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('status')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
              <option value="on_leave">{t('onLeave')}</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateManager') : t('createManager')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Managers;
