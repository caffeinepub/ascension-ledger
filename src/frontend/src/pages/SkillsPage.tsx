import { useGetCallerUserProfile, useListSkills, useUnlockSkill } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Lock, CheckCircle2 } from 'lucide-react';
import { COPY } from '../content/copy';

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

  const renderSkillCard = (skill: typeof skills[0]) => {
    const unlocked = isSkillUnlocked(skill.id);
    const canUnlock = canUnlockSkill(skill);

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
                {unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Lock className="h-5 w-5 text-white/60" />
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

      <div className="grid gap-4 md:grid-cols-2">
        {skills.map(renderSkillCard)}
      </div>

      {skills.length === 0 && (
        <Card style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
          <CardContent className="py-12 text-center">
            <p className="text-white/75">{COPY.skills.noSkills}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
