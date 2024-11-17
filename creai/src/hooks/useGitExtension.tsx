import { useState } from 'react';
import { GitExtension, GitAction } from '@/lib/gitExtension';
import { toast } from 'sonner';

export function useGitExtension(token?: string) {
  const [isLoading, setIsLoading] = useState(false);

  const executeGitAction = async (action: GitAction) => {
    if (!token) {
      toast.error('GitHub token is required. Please login first.');
      return;
    }

    setIsLoading(true);
    const gitExtension = new GitExtension(token);

    try {
      const [owner, repo] = action.repository.split('/');
      
      switch (action.type) {
        case 'clone':
          await gitExtension.cloneRepository(owner, repo);
          toast.success(`Repository ${action.repository} cloned successfully`);
          break;
        
        case 'commit':
          if (!action.message) throw new Error('Commit message is required');
          await gitExtension.createCommit(owner, repo, action.message, action.branch);
          toast.success('Changes committed successfully');
          break;
        
        case 'push':
          await gitExtension.pushChanges(owner, repo, action.branch);
          toast.success('Changes pushed successfully');
          break;
      }
    } catch (error) {
      toast.error(`Git action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeGitAction,
    isLoading
  };
}