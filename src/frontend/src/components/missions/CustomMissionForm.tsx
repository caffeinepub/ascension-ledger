import { useState } from 'react';
import { useCreateUserMission } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { COPY } from '../../content/copy';

export function CustomMissionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState(50);
  const [coinReward, setCoinReward] = useState(25);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMission = useCreateUserMission();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = COPY.customMissions.validation.titleRequired;
    } else if (title.length > 100) {
      newErrors.title = COPY.customMissions.validation.titleTooLong;
    }

    if (!description.trim()) {
      newErrors.description = COPY.customMissions.validation.descriptionRequired;
    } else if (description.length > 500) {
      newErrors.description = COPY.customMissions.validation.descriptionTooLong;
    }

    if (xpReward < 10 || xpReward > 500) {
      newErrors.xpReward = COPY.customMissions.validation.xpRewardRange;
    }

    if (coinReward < 10 || coinReward > 500) {
      newErrors.coinReward = COPY.customMissions.validation.coinRewardRange;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createMission.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        xpReward: BigInt(xpReward),
        coinReward: BigInt(coinReward),
      });

      // Reset form on success
      setTitle('');
      setDescription('');
      setXpReward(50);
      setCoinReward(25);
      setErrors({});
    } catch (error) {
      console.error('Failed to create mission:', error);
    }
  };

  return (
    <Card className="border-primary/20" style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}>
      <CardHeader>
        <CardTitle className="text-accent">{COPY.customMissions.formTitle}</CardTitle>
        <CardDescription className="text-white/75">{COPY.customMissions.formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="mission-title" className="text-white/90">
              {COPY.customMissions.titleLabel}
            </Label>
            <Input
              id="mission-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={COPY.customMissions.titlePlaceholder}
              maxLength={100}
              className="bg-card/50 border-primary/20 text-white placeholder:text-white/40"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="mission-description" className="text-white/90">
              {COPY.customMissions.descriptionLabel}
            </Label>
            <Textarea
              id="mission-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={COPY.customMissions.descriptionPlaceholder}
              maxLength={500}
              rows={3}
              className="bg-card/50 border-primary/20 text-white placeholder:text-white/40 resize-none"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* XP Reward */}
          <div className="space-y-2">
            <Label htmlFor="xp-reward" className="text-white/90">
              {COPY.customMissions.xpRewardLabel}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setXpReward(Math.max(10, xpReward - 10))}
                disabled={xpReward <= 10}
                className="flex-shrink-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="xp-reward"
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Math.max(10, Math.min(500, parseInt(e.target.value) || 10)))}
                min={10}
                max={500}
                className="bg-card/50 border-primary/20 text-white text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setXpReward(Math.min(500, xpReward + 10))}
                disabled={xpReward >= 500}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.xpReward && <p className="text-sm text-destructive">{errors.xpReward}</p>}
          </div>

          {/* Coin Reward */}
          <div className="space-y-2">
            <Label htmlFor="coin-reward" className="text-white/90">
              {COPY.customMissions.coinRewardLabel}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCoinReward(Math.max(10, coinReward - 10))}
                disabled={coinReward <= 10}
                className="flex-shrink-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="coin-reward"
                type="number"
                value={coinReward}
                onChange={(e) => setCoinReward(Math.max(10, Math.min(500, parseInt(e.target.value) || 10)))}
                min={10}
                max={500}
                className="bg-card/50 border-primary/20 text-white text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCoinReward(Math.min(500, coinReward + 10))}
                disabled={coinReward >= 500}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.coinReward && <p className="text-sm text-destructive">{errors.coinReward}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={createMission.isPending}
          >
            {createMission.isPending ? COPY.customMissions.creating : COPY.customMissions.createButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
