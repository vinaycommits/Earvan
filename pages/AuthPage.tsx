import React, { useState } from 'react';
import { User, AuthMode } from '../types';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { Mail, Lock, User as UserIcon, Ear, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null); // Clear errors on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let user: User;
      if (mode === 'LOGIN') {
        if (!formData.username || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        user = await authService.login(formData.username, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.username || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        user = await authService.signup(formData.name, formData.email, formData.username, formData.password);
      }
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-300">
        
        {/* Header */}
        <div className="bg-primary-600 dark:bg-primary-700 p-8 text-center relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform -skew-y-12 scale-150 origin-bottom-left"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Ear className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Earvan</h1>
            <p className="text-primary-100 text-sm">Enhance your world.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="flex gap-4 mb-8 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl transition-colors duration-300">
            <button
              onClick={() => { setMode('LOGIN'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'LOGIN' 
                  ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('SIGNUP'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'SIGNUP' 
                  ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'SIGNUP' && (
              <>
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<UserIcon className="w-5 h-5" />}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail className="w-5 h-5" />}
                />
              </>
            )}
            
            <Input
              label="Username"
              name="username"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
              icon={<UserIcon className="w-5 h-5" />}
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm border border-red-100 dark:border-red-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={isLoading}>
                {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};