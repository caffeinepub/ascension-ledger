import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Mission, Skill } from '../backend';
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

// Skill hooks
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
