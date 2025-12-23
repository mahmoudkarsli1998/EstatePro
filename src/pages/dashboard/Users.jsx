import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, User, Edit, Trash, Download } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Users = () => {
  const { t } = useTranslation();
  const {
    filteredItems: users,
    loading,
    isModalOpen,
    editingItem,
    formData,
    searchTerm,
    setSearchTerm,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCustomChange,
    handleSubmit,
    handleDelete,
    handleExport
  } = useDashboardCrud(
    api.getUsers,
    api.inviteUser, // Mapped to creation/invitation
    api.updateUser,
    api.deleteUser,
    { fullName: '', email: '', role: 'agent' }, // Initial form state
    (user, term) => 
      user.fullName.toLowerCase().includes(term.toLowerCase()) || 
      user.email.toLowerCase().includes(term.toLowerCase())
  );

  // Auto-open modal if requested via navigation state
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreateModal && !loading) {
       handleOpenModal();
       window.history.replaceState({}, document.title);
    }
  }, [location.state, loading]);

  const onExport = () => {
    handleExport(
      "users_export.csv",
      ["ID", "Name", "Email", "Role", "Status", "Joined"],
      u => [u.id, `"${u.fullName}"`, u.email, u.role, u.isActive ? 'Active' : 'Pending', u.createdAt].join(",")
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('users')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('inviteUser')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20">
          <input 
            type="text" 
            placeholder={t('searchUsers')}
            className="w-full max-w-md ps-4 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-section/50 text-textLight font-medium text-sm">
              <tr>
                <th className="px-6 py-4 text-start">{t('user')}</th>
                <th className="px-6 py-4 text-start">{t('role')}</th>
                <th className="px-6 py-4 text-start">{t('status')}</th>
                <th className="px-6 py-4 text-start">{t('joined')}</th>
                <th className="px-6 py-4 text-start">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">{t('loading')}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">{t('noUsersFound')}</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-section dark:hover:bg-white/5 transition-colors border-b border-border/10 dark:border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center me-3">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-textDark dark:text-white">{user.fullName}</div>
                        <div className="text-xs text-textLight dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-textDark dark:text-gray-300">{user.role}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? 'success' : 'warning'}>
                      {user.isActive ? t('active') : t('pending')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-textLight dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleOpenModal(user)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash size={16} />
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
        title={editingItem ? t('editUser') : t('inviteNewUser')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label={t('fullName')} 
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          <Input 
            label={t('emailAddress')} 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={!!editingItem} // Cannot change email for existing users
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('role')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="agent">{t('agent')}</option>
              <option value="manager">{t('managers')}</option>
              <option value="admin">{t('admins')}</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateUser') : t('sendInvitation')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
