import { Repository } from '@/lib/types';
import { GitBranch, Star, Code2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface RepoListProps {
  repositories: Repository[];
  isLoading: boolean;
}

export function RepoList({ repositories, isLoading }: RepoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  if (!repositories?.length) {
    return (
      <div className="text-center py-12">
        <Code2 className="w-12 h-12 mx-auto mb-4 text-primary opacity-80" />
        <h3 className="text-lg font-semibold mb-2">No repositories yet</h3>
        <p className="text-muted-foreground mb-6">Create your first repository to get started</p>
        <Button variant="outline" className="text-primary">
          <GitBranch className="w-4 h-4 mr-2" />
          Create Repository
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories?.map((repo) => (
        <Card 
          key={repo.id} 
          className="p-6 transition-all duration-200 hover:bg-muted/50 border-muted-foreground/10"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground/90 hover:text-primary transition-colors">
                  {repo.name}
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">{repo.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <GitBranch className="w-4 h-4 mr-1 opacity-70" />
                  {repo.language}
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1 opacity-70" />
                  {repo.stars}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}