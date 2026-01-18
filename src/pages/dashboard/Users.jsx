import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, User, Edit, Trash, Download, Copy, Check, AlertTriangle } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import { crmService } from '../../services/crmService';
import { authService } from '../../services/authService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationsContext';

const Users = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { createNotification } = useNotifications();
  const isManager = currentUser?.role === 'manager';
  const [inviteSuccessUser, setInviteSuccessUser] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

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
    handleSubmit: handleCrudSubmit, // Rename hook's submit
    handleDelete,
    handleExport,
    refresh, // Add refresh function
  } = useDashboardCrud(
    crmService.getUsers,
    authService.invite, // Mapped to creation/invitation
    crmService.updateUser,
    crmService.deleteUser,
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

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      handleCrudSubmit(e);
    } else {
      try {
        const newUser = await authService.invite(formData);
        console.log('Invite response:', newUser); // Debug log
        
        if (!newUser.inviteToken) {
          console.warn('No inviteToken in response:', newUser);
          toast.warning(t('inviteTokenMissing', 'Invitation sent but token not received. Check backend response.'));
        }
        
        // Create a notification for the activity feed
        try {
          await createNotification({
            title: t('userInvited', 'User Invited'),
            message: `${currentUser?.fullName || 'Admin'} invited ${formData.email} as ${formData.role}`,
            type: 'NEW_USER',
            metadata: { email: formData.email, role: formData.role }
          });
        } catch (notifErr) {
          console.log('Notification creation failed (non-critical):', notifErr);
        }
        
        await refresh();
        setInviteSuccessUser(newUser);
        toast.success(t('invitationSent', 'Invitation sent successfully!'));
      } catch (error) {
        console.error("Invite failed", error);
        toast.error(error?.response?.data?.message || t('inviteFailed', 'Failed to send invitation'));
      }
    }
  };

  const handleCopyLink = () => {
    if (!inviteSuccessUser) return;
    const url = `${window.location.origin}/invite-accept?token=${inviteSuccessUser.inviteToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeAndReset = () => {
    setInviteSuccessUser(null);
    handleCloseModal();
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
                    {(!isManager || (user.role !== 'admin' && user.role !== 'manager')) && (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeAndReset} 
        title={inviteSuccessUser ? t('invitationSent') : (editingItem ? t('editUser') : t('inviteNewUser'))}
      >
        {inviteSuccessUser ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-green-500">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-textDark dark:text-white mb-2">{t('invitationSentSuccess')}</h3>
            <p className="text-sm text-gray-500 mb-6 px-4">
              {t('invitationSentDesc', { email: inviteSuccessUser.email })}
            </p>
            
            <div className="bg-section dark:bg-white/5 p-4 rounded-xl border border-border/20 dark:border-white/10 mb-6 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                {t('simulatedLink', 'Simulated Invitation Link (Demo Mode)')}
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-background dark:bg-black/20 p-3 rounded-lg text-xs font-mono text-textDark dark:text-gray-300 break-all border border-border/10">
                  {`${window.location.origin}/invite-accept?token=${inviteSuccessUser.inviteToken}`}
                </code>
                <Button onClick={handleCopyLink} variant="outline" className="shrink-0 h-auto">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-3">
               <a 
                 href={`/invite-accept?token=${inviteSuccessUser.inviteToken}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
               >
                 {t('openLinkDirectly', 'Open Link Now')}
               </a>
               <Button onClick={closeAndReset} variant="ghost">{t('close')}</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
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
                <option value="sales">{t('sales')}</option>
                {!isManager && (
                  <>
                    <option value="manager">{t('managers')}</option>
                    <option value="admin">{t('admins')}</option>
                  </>
                )}
              </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateUser') : t('sendInvitation')}</Button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;
