import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { api } from '../../utils/api';
import LoginBackground3D from '../../components/dashboard/LoginBackground3D';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' });
  const [error, setError] = useState('');
  
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationY: isLogin ? 0 : 180,
        duration: 0.8,
        ease: "back.out(1.2)",
      });
    }
  }, { scope: containerRef, dependencies: [isLogin] });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { user, token } = await api.login(formData.email, formData.password);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        // Mock Signup
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
        setIsLogin(true); // Flip back to login on success
        alert("Account created! Please sign in.");
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative perspective-1000">
      {/* 3D Animated Background */}
      <LoginBackground3D />

      <div className="relative w-full max-w-md h-[600px] z-10" style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front Face - Login */}
          <div 
            className="absolute inset-0 w-full h-full glass-panel p-8 flex flex-col justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold font-heading text-white mb-2">{t('welcomeBack')}</h1>
              <p className="text-gray-400">{t('signInToAccess')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('emailAddress')}
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="text-white"
              />
              <Input
                label={t('password')}
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="text-white"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                {t('signIn')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {t('dontHaveAccount')}{' '}
                <button 
                  onClick={() => setIsLogin(false)}
                  className="text-primary hover:text-white font-bold transition-colors"
                >
                  {t('signUp')}
                </button>
              </p>
            </div>
          </div>

          {/* Back Face - Signup */}
          <div 
            className="absolute inset-0 w-full h-full glass-panel p-8 flex flex-col justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold font-heading text-white mb-2">{t('createAccount')}</h1>
              <p className="text-gray-400">{t('joinUs')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('fullName')}
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="text-white"
              />
              <Input
                label={t('emailAddress')}
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="text-white"
              />
              <Input
                label={t('password')}
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="text-white"
              />
              <Input
                label={t('confirmPassword')}
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="text-white"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                {t('signUp')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {t('alreadyHaveAccount')}{' '}
                <button 
                  onClick={() => setIsLogin(true)}
                  className="text-primary hover:text-white font-bold transition-colors"
                >
                  {t('signIn')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
