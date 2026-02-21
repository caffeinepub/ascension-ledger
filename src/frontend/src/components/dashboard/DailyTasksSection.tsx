import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDailyTaskRecommendations, useMarkDailyTaskCompleted } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Coins, Zap, Sparkles } from 'lucide-react';

export function DailyTasksSection() {
  const { data: taskRecommendations, isLoading } = useGetDailyTaskRecommendations();
  const markCompleted = useMarkDailyTaskCompleted();
  const queryClient = useQueryClient();

  // Calculate time until next midnight UTC and set up auto-refresh
  useEffect(() => {
    const scheduleNextRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setUTCHours(24, 0, 0, 0);
      
      const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
      
      console.log('[DailyTasksSection] Scheduling next refresh at midnight UTC', {
        currentTime: now.toISOString(),
        nextMidnight: nextMidnight.toISOString(),
        timeUntilMidnight: `${Math.floor(timeUntilMidnight / 1000 / 60 / 60)}h ${Math.floor((timeUntilMidnight / 1000 / 60) % 60)}m`,
      });

      // Schedule refresh at midnight
      const timeoutId = setTimeout(() => {
        console.log('[DailyTasksSection] Midnight reached - refreshing daily tasks');
        queryClient.invalidateQueries({ queryKey: ['dailyTaskRecommendations'] });
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        
        // Schedule the next refresh for tomorrow
        scheduleNextRefresh();
      }, timeUntilMidnight);

      return timeoutId;
    };

    const timeoutId = scheduleNextRefresh();

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/95">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Daily Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/75">Loading task recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  const incompleteTasks = taskRecommendations?.incomplete || [];
  const completedTasks = taskRecommendations?.completed || [];

  return (
    <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white/95">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Daily Tasks
        </CardTitle>
        <p className="text-sm text-white/75">Complete tasks to earn rewards and progress faster</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/90">Active Tasks</h3>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-primary/30 p-4 transition-colors hover:border-primary/50"
                  style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/50" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-white/95">{task.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/40">
                          <Zap className="mr-1 h-3 w-3" />
                          {Number(task.xpReward)} XP
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
                          <Coins className="mr-1 h-3 w-3" />
                          {Number(task.coinReward)} Credits
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => markCompleted.mutate(task.id)}
                    disabled={markCompleted.isPending}
                    className="flex-shrink-0"
                  >
                    {markCompleted.isPending ? 'Completing...' : 'Complete'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/90">Completed Today</h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border border-green-500/30 p-4"
                  style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-white/75 line-through">{task.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/40">
                        <Zap className="mr-1 h-3 w-3" />
                        {Number(task.xpReward)} XP
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
                        <Coins className="mr-1 h-3 w-3" />
                        {Number(task.coinReward)} Credits
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {incompleteTasks.length === 0 && completedTasks.length === 0 && (
          <div className="py-8 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-white/30" />
            <p className="text-sm text-white/75">No daily tasks available yet.</p>
            <p className="mt-1 text-xs text-white/50">New AI-generated tasks will appear at midnight UTC!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
