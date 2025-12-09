import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { authService } from './services/authService';
import { AuthPage } from './pages/AuthPage';
import { SplashPage } from './pages/SplashPage';
import { PermissionPage } from './pages/PermissionPage';
import { SetupProfilePage } from './pages/SetupProfilePage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('AUTH');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Determine where to send them based on profile existence
      if (user.profile) {
          setCurrentView('SPLASH'); // Or direct to HOME if preferred, but SPLASH is nice welcome
      } else {
          setCurrentView('SPLASH');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('SPLASH');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('AUTH');
  };

  const handleSplashComplete = () => {
    // If we have permissions already? The permission page handles checking.
    // If we have a profile, go to Home, else Setup.
    // Ideally Permission page comes first.
    setCurrentView('PERMISSIONS');
  };

  const handlePermissionsComplete = () => {
    if (currentUser?.profile) {
        setCurrentView('HOME');
    } else {
        setCurrentView('SETUP_PROFILE');
    }
  };

  const handleProfileComplete = () => {
      // Refresh user to get the profile data
      const updatedUser = authService.getCurrentUser();
      setCurrentUser(updatedUser);
      setCurrentView('HOME');
  };
  
  const handleEditProfile = () => {
      setCurrentView('SETUP_PROFILE');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 dark:text-white">
      {/* Route: Auth */}
      {currentView === 'AUTH' && (
        <AuthPage onSuccess={handleAuthSuccess} />
      )}

      {/* Route: Splash */}
      {currentView === 'SPLASH' && currentUser && (
        <SplashPage onGetStarted={handleSplashComplete} userName={currentUser.name} />
      )}

      {/* Route: Permissions */}
      {currentView === 'PERMISSIONS' && currentUser && (
        <PermissionPage onComplete={handlePermissionsComplete} />
      )}

      {/* Route: Setup Profile */}
      {currentView === 'SETUP_PROFILE' && currentUser && (
        <SetupProfilePage user={currentUser} onComplete={handleProfileComplete} />
      )}

      {/* Route: Home/Dashboard */}
      {currentView === 'HOME' && currentUser && (
        <DashboardPage user={currentUser} onLogout={handleLogout} onEditProfile={handleEditProfile} />
      )}
    </div>
  );
}