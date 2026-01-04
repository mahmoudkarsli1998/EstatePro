import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { api } from '../../utils/api';

const InviteAccept = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordLength'));
      return;
    }

    setLoading(true);
    
    try {
      await api.acceptInvite({
        token,
        password: formData.password,
        fullName: formData.fullName
      });

      setLoading(false);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(t('invitationProcessError', 'Failed to process invitation'));
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <LiquidBackground />
        <div className="glass-panel p-8 max-w-md w-full text-center z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('invalidInvitation')}</h2>
          <p className="text-gray-400 mb-6">{t('invitationInvalidDesc')}</p>
          <Button onClick={() => navigate('/')}>{t('goHome')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <LiquidBackground />
      
      <div className="glass-panel p-8 max-w-md w-full z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">{t('welcomeExclamation')}</h1>
          <p className="text-gray-400">{t('completeSetup')}</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-green-500">
              <Check size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('accountCreated')}</h2>
            <p className="text-gray-400">{t('redirectingToLogin')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <Input
              label={t('fullName')}
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
              placeholder="John Doe"
            />

            <Input
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="••••••••"
            />

            <Input
              label={t('confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('settingUp') : t('createAccount')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteAccept;
