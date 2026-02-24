import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetCustomTasks, useToggleCustomTaskCompletion } from '../../hooks/useQueries';
import { COPY } from '../../content/copy';
import { Award, CheckCircle2, Circle, Zap } from 'lucide-react';

export function CustomTaskList() {
  const { data: tasks, isLoading, error } = useGetCustomTasks();
  const toggleCompletion = useToggleCustomTaskCompletion();

  if (isLoading) {
    return (
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardContent className="py-12">
          <p className="text-center text-white/60">{COPY.customTasks.errorLoading}</p>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardContent className="py-12">
          <p className="text-center text-white/60">{COPY.customTasks.noTasks}</p>
        </CardContent>
      </Card>
    );
  }

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
      <CardHeader>
        <CardTitle className="text-white/95">{COPY.customTasks.yourTasks}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/90">{COPY.customTasks.activeTasks}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incompleteTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-primary/40 transition-colors hover:border-primary/60"
                  style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/50" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white/95 mb-2">{task.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-primary" />
                              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
                                {Number(task.points)} {COPY.customTasks.xpPoints}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-4 w-4 text-accent" />
                              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/40">
                                {Number(task.attributePoints)} {COPY.customTasks.attributePoints}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => toggleCompletion.mutate({ taskId: task.id, completed: true })}
                        disabled={toggleCompletion.isPending}
                      >
                        {toggleCompletion.isPending ? COPY.customTasks.completing : COPY.customTasks.complete}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/90">{COPY.customTasks.completedTasks}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-green-500/30 transition-colors"
                  style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white/75 line-through mb-2">{task.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-primary/60" />
                              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
                                {Number(task.points)} {COPY.customTasks.xpPoints}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-4 w-4 text-accent/60" />
                              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/40">
                                {Number(task.attributePoints)} {COPY.customTasks.attributePoints}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleCompletion.mutate({ taskId: task.id, completed: false })}
                        disabled={toggleCompletion.isPending}
                      >
                        {toggleCompletion.isPending ? COPY.customTasks.unmarking : COPY.customTasks.markIncomplete}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
