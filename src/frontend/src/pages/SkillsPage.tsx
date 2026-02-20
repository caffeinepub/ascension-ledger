import { useGetCallerUserProfile, useListSkills, useUnlockSkill } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Lock, CheckCircle2, Dumbbell, Brain, Users, Palette, DollarSign, Heart, BookOpen, Sparkles } from 'lucide-react';
import { COPY } from '../content/copy';

// Skill categories based on real-life skill types
const SKILL_CATEGORIES = {
  physical: { label: 'Physical', icon: Dumbbell, color: 'text-red-400' },
  mental: { label: 'Mental', icon: Brain, color: 'text-blue-400' },
  social: { label: 'Social', icon: Users, color: 'text-green-400' },
  creative: { label: 'Creative', icon: Palette, color: 'text-purple-400' },
  financial: { label: 'Financial', icon: DollarSign, color: 'text-yellow-400' },
  health: { label: 'Health', icon: Heart, color: 'text-pink-400' },
  learning: { label: 'Learning', icon: BookOpen, color: 'text-indigo-400' },
  personal: { label: 'Personal Care', icon: Sparkles, color: 'text-cyan-400' },
};

type SkillCategory = keyof typeof SKILL_CATEGORIES;

// Categorize skills based on their ID or name patterns
function categorizeSkill(skillId: string, skillName: string): SkillCategory {
  const id = skillId.toLowerCase();
  const name = skillName.toLowerCase();
  
  // Physical skills
  if (id.includes('fitness') || id.includes('exercise') || id.includes('workout') || 
      id.includes('running') || id.includes('strength') || id.includes('yoga') ||
      id.includes('physical') || id.includes('power_strike') || id.includes('quick_reflexes') ||
      name.includes('fitness') || name.includes('exercise') || name.includes('workout') ||
      name.includes('strength') || name.includes('strike') || name.includes('reflexes')) {
    return 'physical';
  }
  
  // Mental skills
  if (id.includes('meditation') || id.includes('mindfulness') || id.includes('focus') ||
      id.includes('mental') || id.includes('concentration') || id.includes('improved_focus') ||
      name.includes('meditation') || name.includes('mindfulness') || name.includes('focus')) {
    return 'mental';
  }
  
  // Social skills
  if (id.includes('social') || id.includes('communication') || id.includes('networking') ||
      id.includes('relationship') || id.includes('teamwork') || id.includes('listening') ||
      id.includes('active_listening') ||
      name.includes('social') || name.includes('communication') || name.includes('networking') ||
      name.includes('listening')) {
    return 'social';
  }
  
  // Creative skills
  if (id.includes('creative') || id.includes('art') || id.includes('music') ||
      id.includes('writing') || id.includes('design') || id.includes('creative_writing') ||
      name.includes('creative') || name.includes('art') || name.includes('music') ||
      name.includes('writing')) {
    return 'creative';
  }
  
  // Financial skills
  if (id.includes('financial') || id.includes('budget') || id.includes('saving') ||
      id.includes('investing') || id.includes('money') || id.includes('budgeting') ||
      name.includes('financial') || name.includes('budget') || name.includes('saving')) {
    return 'financial';
  }
  
  // Health skills
  if (id.includes('health') || id.includes('nutrition') || id.includes('diet') ||
      id.includes('sleep') || id.includes('wellness') || id.includes('nutrition_knowledge') ||
      name.includes('health') || name.includes('nutrition') || name.includes('diet')) {
    return 'health';
  }
  
  // Learning skills
  if (id.includes('learning') || id.includes('study') || id.includes('reading') ||
      id.includes('education') || id.includes('skill') || id.includes('speed_reading') ||
      name.includes('learning') || name.includes('study') || name.includes('reading')) {
    return 'learning';
  }
  
  // Personal care skills
  if (id.includes('personal') || id.includes('hygiene') || id.includes('grooming') ||
      id.includes('self_care') || id.includes('organization') || id.includes('time') ||
      id.includes('time_management') ||
      name.includes('personal') || name.includes('hygiene') || name.includes('organization') ||
      name.includes('time management')) {
    return 'personal';
  }
  
  // Default to mental for uncategorized skills
  return 'mental';
}

export function SkillsPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: skills = [] } = useListSkills();
  const unlockSkill = useUnlockSkill();

  const isSkillUnlocked = (skillId: string): boolean => {
    return profile?.unlockedSkills.includes(skillId) || false;
  };

  const canUnlockSkill = (skill: typeof skills[0]): boolean => {
    if (!profile) return false;
    if (isSkillUnlocked(skill.id)) return false;
    if (profile.level < skill.requirements.minLevel) return false;

    for (const [statIndex, minValue] of skill.requirements.minStats) {
      const index = Number(statIndex);
      if (index >= profile.stats.length || profile.stats[index] < minValue) {
        return false;
      }
    }

    return true;
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = categorizeSkill(skill.id, skill.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, typeof skills>);

  const renderSkillCard = (skill: typeof skills[0]) => {
    const unlocked = isSkillUnlocked(skill.id);
    const canUnlock = canUnlockSkill(skill);
    const category = categorizeSkill(skill.id, skill.name);
    const CategoryIcon = SKILL_CATEGORIES[category].icon;

    return (
      <Card 
        key={skill.id} 
        className={`transition-colors ${
          unlocked 
            ? 'border-accent' 
            : 'hover:border-primary'
        }`}
        style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-white/95">
                <CategoryIcon className={`h-5 w-5 ${SKILL_CATEGORIES[category].color}`} />
                {unlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : (
                  <Lock className="h-4 w-4 text-white/60" />
                )}
                {skill.name}
              </CardTitle>
              <CardDescription className="mt-2 text-white/75">{skill.description}</CardDescription>
            </div>
            <Badge variant={unlocked ? 'default' : 'secondary'}>
              {unlocked ? COPY.skills.unlocked : COPY.skills.locked}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/75">{COPY.skills.requirements}:</div>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/75">Min {COPY.dashboard.level}:</span>
                <span className={profile && profile.level >= skill.requirements.minLevel ? 'text-accent' : 'text-destructive'}>
                  {Number(skill.requirements.minLevel)}
                </span>
              </div>
              {skill.requirements.minStats.map(([statIndex, minValue]) => (
                <div key={Number(statIndex)} className="flex items-center justify-between">
                  <span className="text-white/75">Stat {Number(statIndex)}:</span>
                  <span className={profile && profile.stats[Number(statIndex)] >= minValue ? 'text-accent' : 'text-destructive'}>
                    {Number(minValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {unlocked ? (
            <Button disabled className="w-full" variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {COPY.skills.alreadyUnlocked}
            </Button>
          ) : canUnlock ? (
            <Button
              onClick={() => unlockSkill.mutate(skill.id)}
              disabled={unlockSkill.isPending}
              className="w-full"
            >
              {unlockSkill.isPending ? COPY.skills.unlocking : COPY.skills.unlockSkill}
            </Button>
          ) : (
            <Button disabled className="w-full" variant="outline">
              {COPY.skills.requirementsNotMet}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white/95">{COPY.skills.title}</h2>
        <p className="text-white/75">{COPY.skills.description}</p>
      </div>

      {skills.length === 0 ? (
        <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardContent className="py-12 text-center">
            <p className="text-white/75">{COPY.skills.noSkills}</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-2 h-auto bg-black/40 p-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary">
              {COPY.skills.categories.all}
            </TabsTrigger>
            {Object.entries(SKILL_CATEGORIES).map(([key, { label, icon: Icon, color }]) => {
              const categorySkills = skillsByCategory[key as SkillCategory] || [];
              if (categorySkills.length === 0) return null;
              
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-primary"
                >
                  <Icon className={`h-4 w-4 mr-2 ${color}`} />
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              {Object.entries(SKILL_CATEGORIES).map(([key, { label, icon: Icon, color }]) => {
                const categorySkills = skillsByCategory[key as SkillCategory] || [];
                if (categorySkills.length === 0) return null;

                return (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-6 w-6 ${color}`} />
                      <h3 className="text-xl font-semibold text-white/95">{label}</h3>
                      <Badge variant="outline" className="ml-2">
                        {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {categorySkills.map(renderSkillCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(SKILL_CATEGORIES).map(([key, { label }]) => {
            const categorySkills = skillsByCategory[key as SkillCategory] || [];
            if (categorySkills.length === 0) return null;

            return (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {categorySkills.map(renderSkillCard)}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
