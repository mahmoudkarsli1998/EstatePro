import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { User, Mail, Shield, Calendar, Camera, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { uploadService } from '../../services/uploadService';

import { getFullImageUrl } from '../../utils/imageUrlHelper';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // getFullImageUrl removed, imported from utils
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await uploadService.uploadFile(file);
      await updateUser({ avatar: url });
      toast.success(t('avatarUpdated', 'Avatar updated successfully'));
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error(t('avatarUpdateFailed', 'Failed to update avatar'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error(t('passwordsDoNotMatch', 'Passwords do not match'));
    }

    setLoading(true);
    try {
      const updateData = { name: formData.name };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser(updateData);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      toast.success(t('profileUpdatedSuccess', 'Profile updated successfully!'));
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(t('profileUpdateFailed', 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm(t('deactivateConfirm', 'Are you sure you want to deactivate your account? This action cannot be undone.'))) {
      try {
        await authService.deactivateAccount();
        toast.info(t('accountDeactivated', 'Account deactivated'));
        logout();
      } catch (error) {
        console.error('Deactivation failed:', error);
        toast.error(t('deactivationFailed', 'Failed to deactivate account'));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
          {t('myProfile')}
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-1">
          {t('manageYourProfileAndSettings')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-lg">
                <img 
                  src={getFullImageUrl(user?.avatar)} 
                  alt={user?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {user?.name}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mt-2 capitalize">
              <Shield size={14} className="me-1" />
              {user?.role}
            </div>
            
            <div className="mt-6 space-y-3 text-start">
              <div className="flex items-center text-slate-500 dark:text-gray-400 text-sm">
                <Mail size={16} className="me-3" />
                {user?.email}
              </div>
              <div className="flex items-center text-slate-500 dark:text-gray-400 text-sm">
                <Calendar size={16} className="me-3" />
                {t('joined')}: {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {t('editProfile')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('fullName')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
              />
              <Input
                label={t('emailAddress')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                disabled
                helperText={t('emailCannotBeChanged')}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('newPassword')}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('leaveBlankToKeepCurrent')}
                />
                <Input
                  label={t('confirmNewPassword')}
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmNewPassword')}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={loading}>
                  {t('saveChanges')}
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-900/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                  {t('dangerZone')}
                </h3>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
                  {t('deactivateWarning', 'Once you deactivate your account, you will no longer be able to log in or access your data.')}
                </p>
                <Button 
                  variant="danger" 
                  onClick={handleDeactivate}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  <Trash2 size={16} className="me-2" />
                  {t('deactivateAccount')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
