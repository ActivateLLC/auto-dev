import { CommandPalette } from '@/components/CommandPalette';
import { RepoList } from '@/components/RepoList';
import { ActivityFeed } from '@/components/ActivityFeed';
import { useGitHub } from '@/hooks/useGitHub';
import { Button } from '@/components/ui/button';
import { Github, Command } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { auth, repositories, isLoading, login } = useGitHub();

  if (!auth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            AutoDevPro
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your intelligent development companion for seamless Git operations
          </p>
          <Button 
            onClick={login} 
            size="lg"
            className="mt-8 bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 h-auto"
          >
            <Github className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <CommandPalette />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your repositories and automations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                <Command className="w-4 h-4" />
                <span>Press</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
              <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2">
                <img 
                  src={auth.user.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                />
                <span className="text-foreground/80 font-medium hidden sm:block">{auth.user.login}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-muted-foreground/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground/90">Your Repositories</h2>
                    <Button variant="outline" size="sm" className="text-muted-foreground">
                      <Github className="w-4 h-4 mr-2" />
                      New Repository
                    </Button>
                  </div>
                  <RepoList repositories={repositories || []} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-muted-foreground/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground/90 mb-6">Recent Activity</h2>
                  <ActivityFeed />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;