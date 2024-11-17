import { Activity } from '@/lib/types';
import { CheckCircle, Clock, XCircle, GitBranch, Rocket, FileCode, GitPullRequest } from 'lucide-react';

const activities: Activity[] = [
  {
    id: '1',
    type: 'create',
    description: 'Created new repository "auto-dev"',
    timestamp: '2 minutes ago',
    status: 'success',
    icon: <GitBranch className="w-5 h-5" />
  },
  {
    id: '2',
    type: 'deploy',
    description: 'Deploying latest changes to production',
    timestamp: 'just now',
    status: 'pending',
    icon: <Rocket className="w-5 h-5" />
  },
  {
    id: '3',
    type: 'workflow',
    description: 'Generated CI/CD workflow for main branch',
    timestamp: '5 minutes ago',
    status: 'success',
    icon: <FileCode className="w-5 h-5" />
  },
  {
    id: '4',
    type: 'pr',
    description: 'Created pull request #42: Add new features',
    timestamp: '10 minutes ago',
    status: 'success',
    icon: <GitPullRequest className="w-5 h-5" />
  }
];

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="p-4 rounded-lg border border-muted-foreground/10 bg-muted/30 transition-all duration-200 hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {activity.status === 'pending' && (
                <Clock className="w-5 h-5 text-primary animate-pulse" />
              )}
              {activity.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {activity.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-foreground/90">
                {activity.icon}
                <span className="truncate">{activity.description}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.timestamp}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}