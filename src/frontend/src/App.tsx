import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { AppLayout } from './components/layout/AppLayout';
import { ProfileSetupDialog } from './components/profile/ProfileSetupDialog';
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { StatsPage } from './pages/StatsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { LandingPage } from './pages/LandingPage';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';

export type AppScreen = 'dashboard' | 'missions' | 'stats' | 'skills' | 'profile';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  // Show profile setup dialog on first login (works for all authentication methods including Google)
  if (showProfileSetup) {
    return (
      <>
        <ProfileSetupDialog open={true} />
        <Toaster />
      </>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading system...</p>
        </div>
      </div>
    );
  }

  // Main application with navigation
  return (
    <>
      <AppLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {currentScreen === 'dashboard' && <DashboardPage />}
        {currentScreen === 'missions' && <MissionsPage />}
        {currentScreen === 'stats' && <StatsPage />}
        {currentScreen === 'skills' && <SkillsPage />}
        {currentScreen === 'profile' && <ProfileSettingsPage />}
      </AppLayout>
      <Toaster />
    </>
  );
}
