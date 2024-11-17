import { useState, useCallback, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, GitBranch, Rocket, FileCode, GitPullRequest, Plus, RefreshCw, GitFork } from 'lucide-react';
import { toast } from 'sonner';
import { useGitHub } from '@/hooks/useGitHub';
import { useGitExtension } from '@/hooks/useGitExtension';
import { parseCommand } from '@/lib/commandParser';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { createRepository, createBranch, createPullRequest } = useGitHub();
  const { auth } = useGitHub();
  const { executeGitAction, isLoading: gitLoading } = useGitExtension(auth?.token);

  const processNaturalLanguage = async (input: string) => {
    setLoading(true);
    try {
      const command = parseCommand(input);
      
      if (!command) {
        toast.error('Command not recognized. Try something like "create repository" or "create branch"');
        return;
      }

      switch (command.action) {
        case 'create':
          switch (command.target) {
            case 'repository':
              const repoName = command.parameters?.name || prompt('Enter repository name:');
              if (repoName) {
                await createRepository(repoName);
                toast.success(`Repository "${repoName}" created successfully`);
              }
              break;
            case 'branch':
              const branchName = command.parameters?.name || prompt('Enter branch name:');
              if (branchName) {
                await createBranch(branchName);
                toast.success(`Branch "${branchName}" created successfully`);
              }
              break;
            case 'pull request':
              const prTitle = command.parameters?.name || prompt('Enter PR title:');
              if (prTitle) {
                await createPullRequest(prTitle);
                toast.success(`Pull request "${prTitle}" created successfully`);
              }
              break;
          }
          break;
        case 'deploy':
          toast.info(`Deploying to ${command.parameters?.environment || 'production'}...`);
          break;
        case 'generate':
          toast.info(`Generating ${command.target} for ${command.parameters?.name}...`);
          break;
      }
    } catch (error) {
      toast.error('Error processing command');
    } finally {
      setLoading(false);
      setValue('');
      setOpen(false);
    }
  };

  const actions = [
    {
      id: 'create-repo',
      name: 'Create a new repository',
      icon: <Plus className="w-4 h-4" />,
      action: () => processNaturalLanguage('create repository')
    },
    {
      id: 'create-branch',
      name: 'Create a new branch',
      icon: <GitBranch className="w-4 h-4" />,
      action: () => processNaturalLanguage('create branch')
    },
    {
      id: 'create-pr',
      name: 'Create pull request',
      icon: <GitPullRequest className="w-4 h-4" />,
      action: () => processNaturalLanguage('create pull request')
    },
    {
      id: 'deploy',
      name: 'Deploy latest changes',
      icon: <Rocket className="w-4 h-4" />,
      action: () => {
        toast.info("Deploying changes...");
      }
    },
    {
      id: 'sync',
      name: 'Sync repository',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => {
        toast.info("Syncing repository...");
      }
    },
    {
      id: 'clone-repo',
      name: 'Clone repository',
      icon: <GitFork className="w-4 h-4" />,
      action: async () => {
        const repoPath = prompt('Enter repository path (owner/repo):');
        if (repoPath) {
          await executeGitAction({
            type: 'clone',
            repository: repoPath
          });
        }
      }
    },
    {
      id: 'commit-changes',
      name: 'Commit changes',
      icon: <GitBranch className="w-4 h-4" />,
      action: async () => {
        const repoPath = prompt('Enter repository path (owner/repo):');
        const message = prompt('Enter commit message:');
        if (repoPath && message) {
          await executeGitAction({
            type: 'commit',
            repository: repoPath,
            message
          });
        }
      }
    },
    {
      id: 'push-changes',
      name: 'Push changes',
      icon: <RefreshCw className="w-4 h-4" />,
      action: async () => {
        const repoPath = prompt('Enter repository path (owner/repo):');
        if (repoPath) {
          await executeGitAction({
            type: 'push',
            repository: repoPath
          });
        }
      }
    }
  ];

  const handleSelect = useCallback((actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.action();
    }
  }, [actions]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className={`command-palette fixed inset-0 z-50 bg-black/50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className="glass-bg rounded-lg shadow-2xl">
          <Command className="relative" onKeyDown={(e) => {
            if (e.key === 'Enter' && value) {
              processNaturalLanguage(value);
            }
          }}>
            <div className="flex items-center border-b border-muted-foreground/10 px-4">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <Command.Input
                value={value}
                onValueChange={setValue}
                placeholder="Type a command or search..."
                className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {loading ? 'Processing...' : 'No results found.'}
              </Command.Empty>
              <Command.Group heading="Quick Actions">
                {actions.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={action.id}
                    onSelect={() => handleSelect(action.id)}
                    className="px-2 py-3 rounded-lg text-sm cursor-pointer hover:bg-muted flex items-center gap-2"
                  >
                    {action.icon}
                    {action.name}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </div>
    </div>
  );
}
