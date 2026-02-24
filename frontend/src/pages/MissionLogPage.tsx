import { useGetCallerUserProfile, useGetDailyTaskRecommendations } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Calendar, Award, Coins } from 'lucide-react';
import { COPY } from '../content/copy';

export function MissionLogPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: dailyTasks, isLoading: tasksLoading } = useGetDailyTaskRecommendations();

  const isLoading = profileLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{COPY.missionLog.title}</h1>
          <p className="text-white/70">{COPY.missionLog.description}</p>
        </div>
        <div className="text-white/70">Loading mission log...</div>
      </div>
    );
  }

  const completedTasksCount = dailyTasks?.completed?.length || 0;
  const totalTasksCount = (dailyTasks?.completed?.length || 0) + (dailyTasks?.incomplete?.length || 0);
  const completedMissionsCount = userProfile?.completedMissions?.length || 0;

  // Calculate total XP and coins from completed daily tasks today
  const todayXP = dailyTasks?.completed?.reduce((sum, task) => sum + Number(task.xpReward), 0) || 0;
  const todayCoins = dailyTasks?.completed?.reduce((sum, task) => sum + Number(task.coinReward), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{COPY.missionLog.title}</h1>
        <p className="text-white/70">{COPY.missionLog.description}</p>
      </div>

      {/* Today's Summary Card */}
      <Card className="bg-card/25 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-accent" />
            Today's Progress
          </CardTitle>
          <CardDescription className="text-white/70">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <span className="text-sm text-white/70">Tasks Completed</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {completedTasksCount} / {totalTasksCount}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="h-4 w-4 text-accent" />
                <span className="text-sm text-white/70">Missions Completed</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {completedMissionsCount}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-white/70">XP Earned Today</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayXP}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-white/70">Coins Earned Today</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {todayCoins}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics Card */}
      <Card className="bg-card/25 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="h-5 w-5 text-primary" />
            Overall Statistics
          </CardTitle>
          <CardDescription className="text-white/70">
            Your cumulative progress across all activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="text-sm text-white/70 mb-1">Current Level</div>
              <div className="text-2xl font-bold text-white">
                {userProfile?.level ? Number(userProfile.level) : 0}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="text-sm text-white/70 mb-1">Total XP</div>
              <div className="text-2xl font-bold text-white">
                {userProfile?.xp ? Number(userProfile.xp) : 0}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="text-sm text-white/70 mb-1">Total Coins</div>
              <div className="text-2xl font-bold text-white">
                {userProfile?.coins ? Number(userProfile.coins) : 0}
              </div>
            </div>

            <div className="bg-background/40 rounded-lg p-4 border border-primary/10">
              <div className="text-sm text-white/70 mb-1">Skills Unlocked</div>
              <div className="text-2xl font-bold text-white">
                {userProfile?.unlockedSkills?.length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks Today */}
      {completedTasksCount > 0 && (
        <Card className="bg-card/25 border-primary/20">
          <CardHeader>
            <CardTitle className="text-white">Completed Tasks Today</CardTitle>
            <CardDescription className="text-white/70">
              Tasks you've completed in the current cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyTasks?.completed?.map((task) => (
                <div
                  key={task.id}
                  className="bg-background/40 rounded-lg p-4 border border-primary/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium break-words whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {Number(task.xpReward)} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Coins className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {Number(task.coinReward)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {completedTasksCount === 0 && completedMissionsCount === 0 && (
        <Card className="bg-card/25 border-primary/20">
          <CardContent className="py-12">
            <div className="text-center text-white/70">
              <ScrollText className="h-12 w-12 mx-auto mb-4 text-white/40" />
              <p className="text-lg mb-2">No activity logged yet today</p>
              <p className="text-sm">
                Complete tasks and missions to see your daily progress here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
