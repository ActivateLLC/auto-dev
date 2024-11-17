import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitHubAuth, Repository } from '@/lib/types';
import { toast } from 'sonner';
import { 
  initializeGitHub, 
  fetchRepositories, 
  createGitHubRepository,
  createGitHubBranch,
  createGitHubPullRequest
} from '@/lib/github';

const GITHUB_CLIENT_ID = 'your_github_client_id';
const REDIRECT_URI = `${window.location.origin}/github/callback`;

export function useGitHub() {
  const [auth, setAuth] = useState<GitHubAuth | null>(() => {
    const stored = localStorage.getItem('github_auth');
    return stored ? JSON.parse(stored) : null;
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (auth?.token) {
      initializeGitHub(auth.token);
    }
  }, [auth]);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    enabled: !!auth?.token,
    retry: false,
    gcTime: 0,
    staleTime: 0,
    throwOnError: false
  });

  useEffect(() => {
    const handleError = (error: any) => {
      toast.error('Failed to fetch repositories');
      if (error?.status === 401) {
        localStorage.removeItem('github_auth');
        setAuth(null);
      }
    };

    if (repositories === undefined && !isLoading) {
      handleError({ status: 401 });
    }
  }, [repositories, isLoading]);

  const createRepositoryMutation = useMutation({
    mutationFn: createGitHubRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    }
  });

  const login = () => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'repo user',
      state: Math.random().toString(36).substring(7)
    });
    
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  const handleAuthCallback = async (code: string) => {
    try {
      const response = await fetch('/api/github/callback', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      
      if (data.token) {
        const authData = {
          token: data.token,
          user: {
            login: data.login,
            avatar_url: data.avatar_url
          }
        };
        
        localStorage.setItem('github_auth', JSON.stringify(authData));
        setAuth(authData);
        initializeGitHub(data.token);
        toast.success('Successfully logged in');
      }
    } catch (error) {
      toast.error('Failed to authenticate with GitHub');
    }
  };

  const createRepository = async (name: string) => {
    await createRepositoryMutation.mutateAsync(name);
  };

  const createBranch = async (name: string) => {
    if (!auth) throw new Error('Not authenticated');
    await createGitHubBranch(auth.user.login, name, name);
  };

  const createPullRequest = async (title: string) => {
    if (!auth) throw new Error('Not authenticated');
    await createGitHubPullRequest(auth.user.login, 'auto-dev', title, 'feature-branch');
  };

  return { 
    auth, 
    repositories, 
    isLoading, 
    login,
    handleAuthCallback,
    createRepository,
    createBranch,
    createPullRequest
  };
}