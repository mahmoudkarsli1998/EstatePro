import React from 'react';
import { Plus, User, Edit, Trash, Download } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Users = () => {
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
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Users</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="mr-2" /> Export
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" /> Invite User
          </Button>
        </div>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full max-w-md pl-4 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-300">{user.role}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? 'success' : 'warning'}>
                      {user.isActive ? 'Active' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
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
        title={editingItem ? "Edit User" : "Invite New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          <Input 
            label="Email Address" 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={!!editingItem} // Cannot change email for existing users
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingItem ? "Update User" : "Send Invitation"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
