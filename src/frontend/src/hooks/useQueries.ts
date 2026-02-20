import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Mission, Skill, QuestionnaireAnswers, DailyTaskRecommendation, CustomTaskWithStatus, UserMission } from '../backend';
import { toast } from 'sonner';

// Profile hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useInitializeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nickname: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeProfile(nickname);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['currentUserProfile'], profile);
      toast.success('Profile created successfully!');
    },
    onError: (error: Error) => {
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

  const query = useQuery<QuestionnaireAnswers | null>({
    queryKey: ['questionnaireAnswers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getQuestionnaireAnswers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSubmitQuestionnaireAnswers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitQuestionnaireAnswers(answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaireAnswers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Personalization complete! Welcome to CRYONEX.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save preferences');
    },
  });
}

// Daily Tasks hooks
export function useGetDailyTaskRecommendations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyTaskRecommendation>({
    queryKey: ['dailyTaskRecommendations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyTaskRecommendations();
    },
    enabled: !!actor && !actorFetching,
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
      toast.success('Task completed! Great work!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete task');
    },
  });
}

// Custom Tasks hooks
export function useGetCustomTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomTaskWithStatus[]>({
    queryKey: ['customTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateCustomTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, points, attributePoints }: { title: string; points: number; attributePoints: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomTask(title, BigInt(points), BigInt(attributePoints));
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customTasks'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      if (variables.completed) {
        toast.success('Task completed! XP, credits, and attribute points earned!');
      } else {
        toast.success('Task marked as incomplete');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task status');
    },
  });
}

// Stats hooks
export function useGetStatNames() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['statNames'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStatNames();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAllocateStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statAllocations: Array<[bigint, bigint]>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.allocateStats(statAllocations);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['currentUserProfile'], profile);
      toast.success('Stats allocated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to allocate stats');
    },
  });
}

// Mission hooks
export function useListMissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMissions();
    },
    enabled: !!actor && !actorFetching,
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
    onSuccess: (profile) => {
      queryClient.setQueryData(['currentUserProfile'], profile);
      toast.success('Mission completed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete mission');
    },
  });
}

// User Mission hooks
export function useListUserMissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserMission[]>({
    queryKey: ['userMissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserMissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserMission() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserMission(missionId);
    },
  });
}

export function useCreateUserMission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      xpReward, 
      coinReward 
    }: { 
      title: string; 
      description: string; 
      xpReward: number; 
      coinReward: number; 
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUserMission(
        title, 
        description, 
        BigInt(xpReward), 
        BigInt(coinReward)
      );
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
    onSuccess: (profile) => {
      queryClient.setQueryData(['currentUserProfile'], profile);
      queryClient.invalidateQueries({ queryKey: ['userMissions'] });
      toast.success('Custom mission completed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete custom mission');
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
export function useListSkills() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSkills();
    },
    enabled: !!actor && !actorFetching,
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
    onSuccess: (profile) => {
      queryClient.setQueryData(['currentUserProfile'], profile);
      toast.success('Skill unlocked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock skill');
    },
  });
}
