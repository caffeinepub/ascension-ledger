import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { COPY } from '../../content/copy';
import { useState, useEffect } from 'react';

export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in' || isProcessing;

  // Reset processing state when login status changes
  useEffect(() => {
    if (loginStatus === 'idle' || loginStatus === 'success') {
      setIsProcessing(false);
    }
  }, [loginStatus]);

  const handleAuth = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (isAuthenticated) {
        await clear();
        queryClient.clear();
      } else {
        await login();
      }
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      // Reset processing state after a delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {loginStatus === 'logging-in' || isProcessing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {COPY.auth.connecting}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          {COPY.auth.signOut}
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          {COPY.auth.signIn}
        </>
      )}
    </Button>
  );
}
