import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { useCreateCustomTask } from '../../hooks/useQueries';
import { COPY } from '../../content/copy';

export function CustomTaskForm() {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(10);
  const [attributePoints, setAttributePoints] = useState(1);
  const createTask = useCreateCustomTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    if (points < 1 || points > 100) {
      return;
    }

    if (attributePoints < 1 || attributePoints > 10) {
      return;
    }

    await createTask.mutateAsync({ title: title.trim(), points, attributePoints });
    
    // Reset form
    setTitle('');
    setPoints(10);
    setAttributePoints(1);
  };

  const incrementPoints = () => {
    if (points < 100) {
      setPoints(points + 1);
    }
  };

  const decrementPoints = () => {
    if (points > 1) {
      setPoints(points - 1);
    }
  };

  const incrementAttributePoints = () => {
    if (attributePoints < 10) {
      setAttributePoints(attributePoints + 1);
    }
  };

  const decrementAttributePoints = () => {
    if (attributePoints > 1) {
      setAttributePoints(attributePoints - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="taskTitle" className="text-white/90">
          {COPY.customTasks.taskTitleLabel}
        </Label>
        <Input
          id="taskTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={COPY.customTasks.taskTitlePlaceholder}
          maxLength={100}
          className="bg-black/40 border-border/50 text-white/95 placeholder:text-white/40"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskPoints" className="text-white/90">
          {COPY.customTasks.pointsLabel}
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={decrementPoints}
            disabled={points <= 1}
            className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="taskPoints"
            type="number"
            value={points}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= 100) {
                setPoints(val);
              }
            }}
            min={1}
            max={100}
            className="w-24 text-center bg-black/40 border-border/50 text-white/95"
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={incrementPoints}
            disabled={points >= 100}
            className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white/60">{COPY.customTasks.pointsRange}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attributePoints" className="text-white/90">
          {COPY.customTasks.attributePointsLabel}
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={decrementAttributePoints}
            disabled={attributePoints <= 1}
            className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="attributePoints"
            type="number"
            value={attributePoints}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= 10) {
                setAttributePoints(val);
              }
            }}
            min={1}
            max={10}
            className="w-24 text-center bg-black/40 border-border/50 text-white/95"
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={incrementAttributePoints}
            disabled={attributePoints >= 10}
            className="h-10 w-10 border-border/50 bg-black/40 text-white/90 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white/60">{COPY.customTasks.attributePointsRange}</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={createTask.isPending || !title.trim()}
        className="w-full"
      >
        {createTask.isPending ? COPY.customTasks.creating : COPY.customTasks.createButton}
      </Button>
    </form>
  );
}
