import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Mission, Skill, DisciplineSkill, QuestionnaireAnswers, DailyTaskRecommendation, CustomTaskWithStatus, UserMission, LeaderboardEntry, CheatItem } from '../backend';
import { PurchaseResult } from '../backend';
import { toast } from 'sonner';

// Profile hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        console.error('[useGetCallerUserProfile] Actor not available');
        throw new Error('Actor not available');
      }
      
      const startTime = Date.now();
      console.log('[useGetCallerUserProfile] Fetching user profile...', {
        timestamp: new Date().toISOString()
      });
      
      try {
        const profile = await actor.getCallerUserProfile();
        const elapsed = Date.now() - startTime;
        console.log('[useGetCallerUserProfile] Profile fetched successfully', {
          elapsed,
          hasProfile: profile !== null
        });
        return profile;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error('[useGetCallerUserProfile] Profile fetch failed', {
          elapsed,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    },
    enabled: !!actor && actorReady && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 5000);
      console.log(`[useGetCallerUserProfile] Retry attempt ${attemptIndex + 1} in ${delay}ms`);
      return delay;
    },
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useInitializeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nickname: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useInitializeProfile] Initializing profile with nickname:', nickname);
      return actor.initializeProfile(nickname);
    },
    onSuccess: (profile) => {
      console.log('[useInitializeProfile] Profile initialized successfully');
      queryClient.setQueryData(['currentUserProfile'], profile);
      toast.success('Profile created successfully!');
    },
    onError: (error: Error) => {
      console.error('[useInitializeProfile] Failed to initialize profile:', error);
      toast.error(error.message || 'Failed to create profile');
    },
  });
}

export function useUpdateUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUsername: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUsername(newUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Username updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update username');
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });
}

// Questionnaire hooks
export function useGetQuestionnaireAnswers() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  const query = useQuery<QuestionnaireAnswers | null>({
    queryKey: ['questionnaireAnswers'],
    queryFn: async () => {
      if (!actor) {
        console.error('[useGetQuestionnaireAnswers] Actor not available');
        throw new Error('Actor not available');
      }
      
      const startTime = Date.now();
      console.log('[useGetQuestionnaireAnswers] Fetching questionnaire answers...', {
        timestamp: new Date().toISOString()
      });
      
      try {
        const answers = await actor.getQuestionnaireAnswers();
        const elapsed = Date.now() - startTime;
        console.log('[useGetQuestionnaireAnswers] Answers fetched successfully', {
          elapsed,
          hasAnswers: answers !== null && answers.length > 0
        });
        return answers;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error('[useGetQuestionnaireAnswers] Fetch failed', {
          elapsed,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    },
    enabled: !!actor && actorReady && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 5000);
      console.log(`[useGetQuestionnaireAnswers] Retry attempt ${attemptIndex + 1} in ${delay}ms`);
      return delay;
    },
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: actorReady && query.isFetched,
  };
}

export function useSubmitQuestionnaireAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: string[]) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useSubmitQuestionnaireAnswers] Submitting answers');
      return actor.submitQuestionnaireAnswers(answers);
    },
    onSuccess: () => {
      console.log('[useSubmitQuestionnaireAnswers] Answers submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['questionnaireAnswers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Personalization complete! Welcome to CRYONEX.');
    },
    onError: (error: Error) => {
      console.error('[useSubmitQuestionnaireAnswers] Failed to submit:', error);
      toast.error(error.message || 'Failed to save preferences');
    },
  });
}

// Daily Tasks hooks
export function useGetDailyTaskRecommendations() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<DailyTaskRecommendation>({
    queryKey: ['dailyTaskRecommendations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetDailyTaskRecommendations] Fetching daily task recommendations');
      const recommendations = await actor.getDailyTaskRecommendations();
      console.log('[useGetDailyTaskRecommendations] Fetched', {
        incomplete: recommendations.incomplete.length,
        completed: recommendations.completed.length,
      });
      return recommendations;
    },
    enabled: !!actor && actorReady && !actorFetching,
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useMarkDailyTaskCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markDailyTaskCompleted(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTaskRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Task completed! XP and coins earned.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete task');
    },
  });
}

// Custom Tasks hooks
export function useGetCustomTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<CustomTaskWithStatus[]>({
    queryKey: ['customTasks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomTasks();
    },
    enabled: !!actor && actorReady && !actorFetching,
  });
}

export function useCreateCustomTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, points, attributePoints }: { title: string; points: bigint; attributePoints: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomTask(title, points, attributePoints);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customTasks'] });
      toast.success('Custom task created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create custom task');
    },
  });
}

export function useToggleCustomTaskCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleCustomTaskCompletion(taskId, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customTasks'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Task status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task status');
    },
  });
}

export function useDeleteCustomTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customTasks'] });
      toast.success('Custom task deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete custom task');
    },
  });
}

// Stats hooks
export function useAllocateStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statAllocations: [bigint, bigint][]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.allocateStats(statAllocations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Stats allocated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to allocate stats');
    },
  });
}

// Missions hooks
export function useGetMissions() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listMissions();
    },
    enabled: !!actor && actorReady && !actorFetching,
  });
}

export function useCompleteMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Mission completed! Rewards earned.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete mission');
    },
  });
}

// User Missions hooks
export function useGetUserMissions() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<UserMission[]>({
    queryKey: ['userMissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listUserMissions();
    },
    enabled: !!actor && actorReady && !actorFetching,
  });
}

export function useCreateUserMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, xpReward, coinReward }: { title: string; description: string; xpReward: bigint; coinReward: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUserMission(title, description, xpReward, coinReward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMissions'] });
      toast.success('Custom mission created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create custom mission');
    },
  });
}

export function useCompleteUserMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeUserMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMissions'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Mission completed! Rewards earned.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete mission');
    },
  });
}

export function useDeleteUserMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUserMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMissions'] });
      toast.success('Custom mission deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete custom mission');
    },
  });
}

// Skills hooks
export function useGetSkills() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listSkills();
    },
    enabled: !!actor && actorReady && !actorFetching,
  });
}

export function useUnlockSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlockSkill(skillId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Skill unlocked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock skill');
    },
  });
}

// Discipline Skills hooks
export function useListDisciplineSkills() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<DisciplineSkill[]>({
    queryKey: ['disciplineSkills'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listDisciplineSkills();
    },
    enabled: !!actor && actorReady && !actorFetching,
  });
}

// Leaderboard hook
export function useLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const entries = await actor.getLeaderboard();
      // Sort by level descending (highest level = rank 1)
      return [...entries].sort((a, b) => Number(b.level) - Number(a.level));
    },
    enabled: !!actor && actorReady && !actorFetching,
    staleTime: 60000,
  });
}

// Cheat Store hooks
export function useGetCheatItems() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<CheatItem[]>({
    queryKey: ['cheatItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCheatItems();
    },
    enabled: !!actor && actorReady && !actorFetching,
    staleTime: 300000,
  });
}

export function useGetUserCheatPurchasesToday() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorReady = !!actor && !actorFetching;

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['userCheatPurchasesToday'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserCheatPurchasesToday();
    },
    enabled: !!actor && actorReady && !actorFetching,
    staleTime: 0,
  });
}

export function usePurchaseCheat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cheatId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseCheat(cheatId);
    },
    onSuccess: (result) => {
      if (result === PurchaseResult.success) {
        toast.success('Enjoy your treat! 🎉');
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userCheatPurchasesToday'] });
      } else if (result === PurchaseResult.insufficientCredits) {
        toast.error('Not enough credits to purchase this cheat.');
      } else if (result === PurchaseResult.dailyLimitReached) {
        toast.error('Daily limit reached for this cheat. Try again tomorrow!');
      } else if (result === PurchaseResult.itemNotFound) {
        toast.error('Cheat item not found.');
      } else if (result === PurchaseResult.unauthorized) {
        toast.error('You must be logged in to purchase cheats.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to purchase cheat');
    },
  });
}
