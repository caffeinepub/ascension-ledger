import { useGetCallerUserProfile, useGetSkills, useUnlockSkill } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Lock, CheckCircle2, TrendingUp, Dumbbell, Brain, Heart, Users, Briefcase, DollarSign, BookOpen, Clock } from 'lucide-react';
import { COPY } from '../content/copy';

export function SkillsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: skills = [] } = useGetSkills();
  const unlockSkill = useUnlockSkill();

  const isSkillUnlocked = (skillId: string): boolean => {
    if (!profile) return false;
    return profile.unlockedSkills.includes(skillId);
  };

  const canUnlockSkill = (skill: typeof skills[0]): boolean => {
    if (!profile) return false;
    if (isSkillUnlocked(skill.id)) return false;
    if (profile.level < Number(skill.requirements.minLevel)) return false;

    for (const [statIndex, minValue] of skill.requirements.minStats) {
      const index = Number(statIndex);
      if (index >= profile.stats.length || profile.stats[index] < minValue) {
        return false;
      }
    }

    return true;
  };

  const getSkillCategory = (skillId: string): string => {
    const categoryMap: Record<string, string> = {
      strength_training: 'physical',
      power_strike: 'physical',
      quick_reflexes: 'physical',
      improved_focus: 'mental',
      speed_reading: 'mental',
      time_management: 'productivity',
      active_listening: 'social',
      creative_writing: 'creative',
      budgeting: 'financial',
      nutrition_knowledge: 'health',
    };
    return categoryMap[skillId] || 'general';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Dumbbell className="h-5 w-5" />;
      case 'mental':
        return <Brain className="h-5 w-5" />;
      case 'productivity':
        return <Clock className="h-5 w-5" />;
      case 'social':
        return <Users className="h-5 w-5" />;
      case 'creative':
        return <Zap className="h-5 w-5" />;
      case 'financial':
        return <DollarSign className="h-5 w-5" />;
      case 'health':
        return <Heart className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'physical':
        return 'text-red-400';
      case 'mental':
        return 'text-blue-400';
      case 'productivity':
        return 'text-green-400';
      case 'social':
        return 'text-purple-400';
      case 'creative':
        return 'text-yellow-400';
      case 'financial':
        return 'text-emerald-400';
      case 'health':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = getSkillCategory(skill.id);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const categoryNames: Record<string, string> = {
    physical: COPY.skills.categories.physical,
    mental: COPY.skills.categories.mental,
    productivity: COPY.skills.categories.productivity,
    social: COPY.skills.categories.social,
    creative: COPY.skills.categories.creative,
    financial: COPY.skills.categories.financial,
    health: COPY.skills.categories.health,
    general: COPY.skills.categories.general,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-white/95">{COPY.skills.title}</h1>
        <p className="mt-2 text-white/70">{COPY.skills.subtitle}</p>
      </div>

      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <section key={category}>
          <div className="mb-4 flex items-center gap-2">
            <span className={getCategoryColor(category)}>{getCategoryIcon(category)}</span>
            <h2 className="text-2xl font-semibold text-white/90">{categoryNames[category] || category}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categorySkills.map((skill) => {
              const unlocked = isSkillUnlocked(skill.id);
              const canUnlock = canUnlockSkill(skill);

              return (
                <Card
                  key={skill.id}
                  className={`transition-colors ${unlocked ? 'border-primary' : canUnlock ? 'border-accent hover:border-accent/70' : 'border-border/30'}`}
                  style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2 text-white/95">
                        {unlocked ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-white/40" />
                        )}
                        {skill.name}
                      </CardTitle>
                      <Badge variant={unlocked ? 'default' : 'secondary'}>
                        {unlocked ? COPY.skills.unlocked : COPY.skills.locked}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/75">{skill.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>
                          {COPY.skills.requiresLevel} {Number(skill.requirements.minLevel)}
                        </span>
                      </div>
                      {skill.requirements.minStats.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white/80">{COPY.skills.requiresStats}</p>
                          {skill.requirements.minStats.map(([statIndex, minValue]) => {
                            const index = Number(statIndex);
                            const statNames = [
                              'Academics',
                              'Creativity',
                              'Fitness',
                              'Health',
                              'Life Skills',
                              'Mental Health',
                              'Productivity',
                              'Relationship Building',
                              'Self Awareness',
                              'Self Care',
                              'Social Awareness',
                              'Wealth',
                              'Work',
                            ];
                            const statName = statNames[index] || `Stat ${index}`;
                            const currentValue = profile?.stats[index] || 0n;
                            const meetsRequirement = currentValue >= minValue;

                            return (
                              <div
                                key={index}
                                className={`flex items-center justify-between text-xs ${meetsRequirement ? 'text-primary' : 'text-white/60'}`}
                              >
                                <span>{statName}</span>
                                <span>
                                  {Number(currentValue)} / {Number(minValue)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {unlocked ? (
                      <Button disabled className="w-full" variant="outline">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {COPY.skills.unlocked}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => unlockSkill.mutate(skill.id)}
                        disabled={!canUnlock || unlockSkill.isPending}
                        className="w-full"
                      >
                        {unlockSkill.isPending ? COPY.skills.unlocking : COPY.skills.unlock}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {skills.length === 0 && (
        <p className="text-center text-white/60">{COPY.skills.noSkills}</p>
      )}
    </div>
  );
}
