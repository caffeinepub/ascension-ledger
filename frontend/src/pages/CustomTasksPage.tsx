import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COPY } from '../content/copy';
import { CustomTaskForm } from '../components/tasks/CustomTaskForm';
import { CustomTaskList } from '../components/tasks/CustomTaskList';

export function CustomTasksPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-white/95">{COPY.customTasks.title}</h1>
        <p className="text-white/75">{COPY.customTasks.description}</p>
      </div>

      {/* Create Task Form */}
      <Card style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} className="border-border/50">
        <CardHeader>
          <CardTitle className="text-white/95">{COPY.customTasks.createTaskTitle}</CardTitle>
          <CardDescription className="text-white/60">{COPY.customTasks.createTaskDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomTaskForm />
        </CardContent>
      </Card>

      {/* Task List */}
      <CustomTaskList />
    </div>
  );
}
