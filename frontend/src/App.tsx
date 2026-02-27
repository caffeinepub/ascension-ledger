import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetQuestionnaireAnswers } from './hooks/useQueries';
import { AppLayout } from './components/layout/AppLayout';
import { ProfileSetupDialog } from './components/profile/ProfileSetupDialog';
import { PersonalizationQuestionnaire } from './components/profile/PersonalizationQuestionnaire';
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { StatsPage } from './pages/StatsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { CustomTasksPage } from './pages/CustomTasksPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CheatStorePage } from './pages/CheatStorePage';
import { LandingPage } from './pages/LandingPage';
import { InitializationError } from './components/auth/InitializationError';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useActor } from './hooks/useActor';
import { isDraftEnvironment } from './utils/cacheControl';

export type AppScreen = 'dashboard' | 'missions' | 'stats' | 'skills' | 'profile' | 'customTasks' | 'leaderboard' | 'cheatStore';

const INITIALIZATION_TIMEOUT = 10000; // 10 seconds (reduced from 20)
const MAX_RETRY_ATTEMPTS = 3;

export default function App() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched, 
    error: profileError,
    refetch: refetchProfile 
  } = useGetCallerUserProfile();
  const { 
    data: questionnaireAnswers, 
    isLoading: questionnaireLoading, 
    isFetched: questionnaireFetched, 
    error: questionnaireError,
    refetch: refetchQuestionnaire 
  } = useGetQuestionnaireAnswers();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [initializationTimedOut, setInitializationTimedOut] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [actorTimeout, setActorTimeout] = useState(false);

  const isAuthenticated = !!identity;
  const isDraft = isDraftEnvironment();
  
  // Derive actor readiness from available properties
  const actorReady = !!actor && !actorFetching && !isInitializing;
  const actorError = actorTimeout ? new Error('Actor creation timed out') : null;

  // Monitor actor creation timeout
  useEffect(() => {
    if (!isAuthenticated || isInitializing) {
      setActorTimeout(false);
      return;
    }

    if (actorFetching && !actor) {
      console.log('[App] Actor fetching, starting timeout monitor...');
      const timeoutId = setTimeout(() => {
        if (actorFetching && !actor) {
          console.error('[App] Actor creation timed out after 8 seconds');
          setActorTimeout(true);
        }
      }, 8000);

      return () => clearTimeout(timeoutId);
    } else if (actor) {
      console.log('[App] Actor ready, clearing timeout flag');
      setActorTimeout(false);
    }
  }, [isAuthenticated, isInitializing, actorFetching, actor]);

  // Enhanced logging for initialization flow
  useEffect(() => {
    console.log('[App] Initialization state:', {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      isDraft,
      loginStatus,
      isInitializing,
      actorFetching,
      actorReady,
      hasActor: !!actor,
      actorTimeout,
      profileLoading,
      profileFetched,
      questionnaireLoading,
      questionnaireFetched,
      retryAttempt,
      errors: {
        actor: actorError?.message,
        profile: profileError?.message,
        questionnaire: questionnaireError?.message
      }
    });
  }, [
    isAuthenticated, 
    isDraft, 
    loginStatus, 
    isInitializing, 
    actorFetching, 
    actorReady,
    actor,
    actorTimeout,
    profileLoading, 
    profileFetched, 
    questionnaireLoading, 
    questionnaireFetched,
    retryAttempt,
    actorError,
    profileError,
    questionnaireError
  ]);

  // Retry logic with exponential backoff
  useEffect(() => {
    if (!isAuthenticated || isRetrying) return;

    const hasError = actorError || profileError || questionnaireError;
    if (hasError && retryAttempt < MAX_RETRY_ATTEMPTS) {
      const delay = Math.pow(2, retryAttempt) * 2000; // 2s, 4s, 8s
      console.log(`[App] Scheduling retry attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS} in ${delay}ms`);
      
      setIsRetrying(true);
      const retryTimer = setTimeout(async () => {
        console.log(`[App] Executing retry attempt ${retryAttempt + 1}`);
        setRetryAttempt(prev => prev + 1);
        
        // Reset actor timeout flag
        if (actorError) {
          console.log('[App] Resetting actor timeout flag...');
          setActorTimeout(false);
        }
        
        // Refetch queries that failed
        if (profileError) {
          console.log('[App] Retrying profile fetch...');
          await refetchProfile();
        }
        if (questionnaireError) {
          console.log('[App] Retrying questionnaire fetch...');
          await refetchQuestionnaire();
        }
        
        setIsRetrying(false);
      }, delay);

      return () => clearTimeout(retryTimer);
    }
  }, [
    isAuthenticated, 
    actorError,
    profileError, 
    questionnaireError, 
    retryAttempt, 
    isRetrying,
    refetchProfile,
    refetchQuestionnaire
  ]);

  // Timeout detection for initialization
  useEffect(() => {
    if (!isAuthenticated) {
      setInitializationTimedOut(false);
      setRetryAttempt(0);
      return;
    }

    // Don't start timeout if we're still initializing auth
    if (isInitializing) {
      return;
    }

    console.log('[App] Starting initialization timeout timer...');
    const timeoutId = setTimeout(() => {
      // Check if we're still loading after timeout period
      const stillLoading = actorFetching || !actorReady || profileLoading || !profileFetched || questionnaireLoading || !questionnaireFetched;
      
      if (stillLoading) {
        console.error('[App] Initialization timeout detected after', INITIALIZATION_TIMEOUT, 'ms', {
          timestamp: new Date().toISOString(),
          isInitializing,
          actorFetching,
          actorReady,
          actorTimeout,
          profileLoading,
          profileFetched,
          questionnaireLoading,
          questionnaireFetched,
          hasActor: !!actor,
          hasIdentity: !!identity,
          isDraft,
          retryAttempt
        });
        setInitializationTimedOut(true);
      } else {
        console.log('[App] Initialization completed before timeout');
      }
    }, INITIALIZATION_TIMEOUT);

    return () => {
      console.log('[App] Clearing initialization timeout timer');
      clearTimeout(timeoutId);
    };
  }, [
    isAuthenticated, 
    isInitializing, 
    actorFetching, 
    actorReady,
    actorTimeout,
    profileLoading, 
    profileFetched, 
    questionnaireLoading, 
    questionnaireFetched, 
    actor, 
    identity, 
    isDraft,
    retryAttempt
  ]);

  // Reset timeout flag when initialization completes successfully
  useEffect(() => {
    if (isAuthenticated && !isInitializing && actorReady && !actorFetching && profileFetched && questionnaireFetched) {
      console.log('[App] Initialization completed successfully, resetting error states');
      setInitializationTimedOut(false);
      setRetryAttempt(0);
      setActorTimeout(false);
    }
  }, [isAuthenticated, isInitializing, actorReady, actorFetching, profileFetched, questionnaireFetched]);

  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  // Show error if initialization timed out or max retries exceeded or actor failed
  const hasExhaustedRetries = retryAttempt >= MAX_RETRY_ATTEMPTS && (actorError || profileError || questionnaireError);
  const hasActorError = !!actorError;
  
  if (initializationTimedOut || hasExhaustedRetries || hasActorError) {
    const errorDetails = {
      message: actorError?.message || profileError?.message || questionnaireError?.message || 'System initialization timed out',
      actorStatus: actorReady ? 'Ready' : actorFetching ? 'Loading' : actorError ? 'Failed' : 'Not initialized',
      authStatus: isInitializing ? 'Initializing' : 'Authenticated',
      profileStatus: profileFetched ? 'Fetched' : profileLoading ? 'Loading' : profileError ? 'Failed' : 'Not fetched',
      questionnaireStatus: questionnaireFetched ? 'Fetched' : questionnaireLoading ? 'Loading' : questionnaireError ? 'Failed' : 'Not fetched',
      retryAttempt,
      isDraft
    };
    
    console.error('[App] Showing initialization error:', errorDetails);
    
    return (
      <>
        <InitializationError 
          error={errorDetails.message}
          details={errorDetails}
        />
        <Toaster />
      </>
    );
  }

  // Show loading state while initializing
  const isLoading = isInitializing || !actorReady || actorFetching || profileLoading || !profileFetched || questionnaireLoading || !questionnaireFetched || isRetrying;
  
  if (isLoading) {
    let loadingMessage = 'Initializing system...';
    let loadingProgress = 0;
    
    if (isInitializing) {
      loadingMessage = 'Connecting to Internet Identity...';
      loadingProgress = 20;
    } else if (!actorReady || actorFetching) {
      loadingMessage = 'Establishing backend connection...';
      loadingProgress = 40;
    } else if (profileLoading || !profileFetched) {
      loadingMessage = 'Loading your profile...';
      loadingProgress = 70;
    } else if (questionnaireLoading || !questionnaireFetched) {
      loadingMessage = 'Loading preferences...';
      loadingProgress = 90;
    } else if (isRetrying) {
      loadingMessage = `Retrying connection (${retryAttempt}/${MAX_RETRY_ATTEMPTS})...`;
      loadingProgress = 50;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mb-4 text-lg text-white/90">
            {loadingMessage}
            {isDraft && <span className="ml-2 text-xs text-primary">(Draft Mode)</span>}
          </div>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10 mx-auto">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          {retryAttempt > 0 && (
            <div className="mt-4 text-sm text-primary">
              Retry attempt {retryAttempt}/{MAX_RETRY_ATTEMPTS}
            </div>
          )}
          <div className="mt-2 text-xs text-white/50">
            Please wait while we connect to the network...
          </div>
          <div className="mt-4 text-xs text-white/40">
            If this takes too long, the page will automatically show recovery options.
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Show profile setup dialog on first login
  const showProfileSetup = userProfile === null;
  if (showProfileSetup) {
    console.log('[App] Showing profile setup dialog');
    return (
      <>
        <ProfileSetupDialog open={true} />
        <Toaster />
      </>
    );
  }

  // Show personalization questionnaire after profile setup
  const showQuestionnaire = userProfile !== null && (!questionnaireAnswers || questionnaireAnswers.length === 0);
  if (showQuestionnaire) {
    console.log('[App] Showing personalization questionnaire');
    return (
      <>
        <PersonalizationQuestionnaire open={true} />
        <Toaster />
      </>
    );
  }

  console.log('[App] Rendering main application');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardPage />;
      case 'missions':
        return <MissionsPage />;
      case 'stats':
        return <StatsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'cheatStore':
        return <CheatStorePage />;
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
