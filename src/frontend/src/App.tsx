import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetQuestionnaireAnswers } from './hooks/useQueries';
import { AppLayout } from './components/layout/AppLayout';
import { ProfileSetupDialog } from './components/profile/ProfileSetupDialog';
import { PersonalizationQuestionnaire } from './components/profile/PersonalizationQuestionnaire';
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { MissionLogPage } from './pages/MissionLogPage';
import { StatsPage } from './pages/StatsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { CustomTasksPage } from './pages/CustomTasksPage';
import { LandingPage } from './pages/LandingPage';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';

export type AppScreen = 'dashboard' | 'missions' | 'missionLog' | 'stats' | 'skills' | 'profile' | 'customTasks';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: questionnaireAnswers, isLoading: questionnaireLoading, isFetched: questionnaireFetched } = useGetQuestionnaireAnswers();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showQuestionnaire = isAuthenticated && !profileLoading && isFetched && userProfile !== null && !questionnaireLoading && questionnaireFetched && (!questionnaireAnswers || questionnaireAnswers.length === 0);

  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  // Show profile setup dialog on first login
  if (showProfileSetup) {
    return (
      <>
        <ProfileSetupDialog open={true} />
        <Toaster />
      </>
    );
  }

  // Show personalization questionnaire after profile setup
  if (showQuestionnaire) {
    return (
      <>
        <PersonalizationQuestionnaire open={true} />
        <Toaster />
      </>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading || !isFetched || questionnaireLoading || !questionnaireFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg text-white/90">Initializing system...</div>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-primary"></div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardPage />;
      case 'missions':
        return <MissionsPage />;
      case 'missionLog':
        return <MissionLogPage />;
      case 'stats':
        return <StatsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'profile':
        return <ProfileSettingsPage />;
      case 'customTasks':
        return <CustomTasksPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <AppLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {renderScreen()}
      </AppLayout>
      <Toaster />
    </>
  );
}
