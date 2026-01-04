import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate update
    alert(t('profileUpdatedSuccess', 'Profile updated successfully!'));
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
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-white dark:border-white/10 shadow-lg">
              <img 
                src={user?.avatar || "https://via.placeholder.com/150"} 
                alt={user?.name} 
                className="w-full h-full object-cover"
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
                {t('joined')}: {user?.joinDate || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
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
                <Button type="submit">
                  {t('saveChanges')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
