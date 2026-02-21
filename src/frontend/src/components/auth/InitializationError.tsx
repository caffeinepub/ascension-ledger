import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { clearAllCaches, unregisterServiceWorkers, hardReload, isDraftEnvironment } from '@/utils/cacheControl';

interface InitializationErrorProps {
  error: string;
  details?: {
    actorStatus?: string;
    authStatus?: string;
    profileStatus?: string;
    questionnaireStatus?: string;
    retryAttempt?: number;
    isDraft?: boolean;
  };
}

export function InitializationError({ error, details }: InitializationErrorProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isDraft = isDraftEnvironment();

  const handleRetry = () => {
    console.log('[InitializationError] User clicked Retry');
    window.location.reload();
  };

  const handleClearCacheAndRetry = async () => {
    console.log('[InitializationError] User clicked Clear Cache & Retry');
    setIsClearing(true);
    try {
      await clearAllCaches();
      await unregisterServiceWorkers();
      console.log('[InitializationError] Cache cleared, reloading...');
      // Wait a moment for cleanup to complete
      setTimeout(() => {
        hardReload();
      }, 500);
    } catch (error) {
      console.error('[InitializationError] Failed to clear cache:', error);
      // Try reload anyway
      setTimeout(() => {
        hardReload();
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-destructive/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/20 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Initialization Failed</h2>
            <p className="text-sm text-white/60">
              {isDraft ? 'Draft environment detected' : 'Unable to connect'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/80">
            The system failed to initialize properly. This could be due to network issues, cached content, or backend connectivity problems.
          </p>

          {isDraft && (
            <div className="rounded-md bg-primary/10 border border-primary/30 p-4 space-y-2">
              <p className="font-semibold text-primary text-sm">🚀 Draft Environment Detected</p>
              <p className="text-xs text-primary/90">
                You're running on <code className="bg-black/30 px-1 py-0.5 rounded">draft.caffeine.xyz</code>
              </p>
              <p className="text-xs text-primary/80 leading-relaxed">
                Cache issues are common in draft environments. <strong>Clearing cache often resolves initialization problems.</strong>
              </p>
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-xs font-medium text-white/70">Error Message:</p>
            <p className="mt-1 text-xs text-white/60 break-words">{error}</p>
          </div>

          {details && (
            <>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>

              {showDetails && (
                <div className="space-y-2 rounded-md bg-black/30 p-3 text-xs font-mono text-white/60">
                  <div className="border-b border-white/10 pb-2 mb-2">
                    <span className="text-white/70 font-semibold">System Status</span>
                  </div>
                  <div>
                    <span className="text-white/40">Environment:</span>{' '}
                    <span className={isDraft ? 'text-primary' : 'text-white/60'}>
                      {isDraft ? 'Draft (draft.caffeine.xyz)' : 'Production'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Authentication:</span>{' '}
                    <span className="text-white/60">{details.authStatus || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Backend Actor:</span>{' '}
                    <span className={
                      details.actorStatus === 'Ready' ? 'text-green-400' : 
                      details.actorStatus === 'Failed' ? 'text-red-400' : 
                      'text-yellow-400'
                    }>
                      {details.actorStatus || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Profile:</span>{' '}
                    <span className={
                      details.profileStatus === 'Fetched' ? 'text-green-400' :
                      details.profileStatus === 'Failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }>
                      {details.profileStatus || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Preferences:</span>{' '}
                    <span className={
                      details.questionnaireStatus === 'Fetched' ? 'text-green-400' :
                      details.questionnaireStatus === 'Failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }>
                      {details.questionnaireStatus || 'Unknown'}
                    </span>
                  </div>
                  {details.retryAttempt !== undefined && details.retryAttempt > 0 && (
                    <div>
                      <span className="text-white/40">Retry Attempts:</span>{' '}
                      <span className="text-yellow-400">{details.retryAttempt}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <span className="text-white/40">Hostname:</span>{' '}
                    <span className="text-white/60">{window.location.hostname}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Service Worker:</span>{' '}
                    <span className="text-white/60">
                      {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Cache API:</span>{' '}
                    <span className="text-white/60">
                      {'caches' in window ? 'Available' : 'Not available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Timestamp:</span>{' '}
                    <span className="text-white/60">{new Date().toISOString()}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isDraft && (
            <Button
              onClick={handleClearCacheAndRetry}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
              disabled={isClearing}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {isClearing ? 'Clearing Cache...' : 'Clear Cache & Reload'}
            </Button>
          )}

          <Button
            onClick={handleRetry}
            className="w-full"
            variant={isDraft ? "outline" : "default"}
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isDraft ? 'Reload Without Clearing' : 'Retry'}
          </Button>

          {!isDraft && (
            <Button
              onClick={handleClearCacheAndRetry}
              className="w-full"
              variant="outline"
              disabled={isClearing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? 'Clearing Cache...' : 'Clear Cache & Retry'}
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-white/50">
          {isDraft 
            ? 'Draft environments may have caching issues. Try clearing cache first.'
            : 'If the problem persists after clearing cache, please check your internet connection or try again later.'
          }
        </p>
      </div>
    </div>
  );
}
