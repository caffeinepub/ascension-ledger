import { useGetCallerUserProfile, useGetCheatItems, useGetUserCheatPurchasesToday, usePurchaseCheat } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Coins, ShoppingBag, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export function CheatStorePage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: cheatItems, isLoading: itemsLoading } = useGetCheatItems();
  const { data: purchasesToday, isLoading: purchasesLoading } = useGetUserCheatPurchasesToday();
  const purchaseCheat = usePurchaseCheat();

  const isLoading = profileLoading || itemsLoading || purchasesLoading;

  // Build a map of cheatId -> purchaseCount for today
  const purchaseCountMap: Record<string, number> = {};
  if (purchasesToday) {
    for (const [cheatId, count] of purchasesToday) {
      purchaseCountMap[cheatId] = Number(count);
    }
  }

  const userCredits = userProfile ? Number(userProfile.credits) : 0;

  const handlePurchase = (cheatId: string) => {
    purchaseCheat.mutate(cheatId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-white" style={{
            textShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
          }}>
            CHEAT STORE
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Spend your hard-earned credits on guilt-free rewards
          </p>
        </div>

        {/* Credit Balance */}
        <div
          className="flex items-center gap-3 rounded-lg px-5 py-3 border border-primary/30 self-start sm:self-auto"
          style={{ background: 'rgba(6, 182, 212, 0.08)', backdropFilter: 'blur(8px)' }}
        >
          <Coins className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest">Credits</p>
            {profileLoading ? (
              <Skeleton className="h-6 w-16 mt-0.5" />
            ) : (
              <p className="text-xl font-bold text-primary">{userCredits.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className="rounded-lg border border-accent/20 px-4 py-3 text-sm text-white/70"
        style={{ background: 'rgba(251, 146, 60, 0.06)' }}
      >
        <span className="font-semibold text-accent">How it works:</span> Earn credits by completing missions and tasks. Spend them here on real-life rewards. Daily limits reset at midnight UTC.
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 p-5 space-y-3"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cheat Items Grid */}
      {!isLoading && cheatItems && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cheatItems.map((item) => {
            const creditCost = Number(item.creditCost);
            const dailyLimit = Number(item.dailyLimit);
            const purchasedToday = purchaseCountMap[item.id] ?? 0;
            const remainingUses = dailyLimit - purchasedToday;
            const isSoldOut = remainingUses <= 0;
            const cannotAfford = userCredits < creditCost;
            const isDisabled = isSoldOut || cannotAfford || purchaseCheat.isPending;
            const isPurchasingThis = purchaseCheat.isPending && purchaseCheat.variables === item.id;

            return (
              <div
                key={item.id}
                className={`relative rounded-xl border p-5 flex flex-col gap-3 transition-all duration-200 ${
                  isDisabled
                    ? 'border-border/20 opacity-70'
                    : 'border-primary/25 hover:border-primary/50 hover:shadow-[0_0_16px_rgba(6,182,212,0.12)]'
                }`}
                style={{
                  background: isDisabled
                    ? 'rgba(0,0,0,0.4)'
                    : 'rgba(6,182,212,0.05)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Sold Out Badge */}
                {isSoldOut && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs bg-white/10 text-white/50 border-white/10">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done today
                    </Badge>
                  </div>
                )}

                {/* Lock icon for insufficient credits */}
                {!isSoldOut && cannotAfford && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-destructive/60" />
                  </div>
                )}

                {/* Item Name */}
                <h3 className={`font-semibold text-base leading-tight pr-8 ${isDisabled ? 'text-white/50' : 'text-white'}`}>
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/55 leading-relaxed flex-1">
                  {item.description}
                </p>

                {/* Footer: cost + uses + buy button */}
                <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      {/* Credit Cost */}
                      <div className="flex items-center gap-1.5">
                        <Coins className={`h-4 w-4 ${isDisabled ? 'text-white/30' : 'text-primary'}`} />
                        <span className={`text-sm font-bold ${isDisabled ? 'text-white/40' : 'text-primary'}`}>
                          {creditCost} credits
                        </span>
                      </div>
                      {/* Daily Uses */}
                      <span className="text-xs text-white/40">
                        {isSoldOut
                          ? `Limit reached (${dailyLimit}/${dailyLimit})`
                          : `${remainingUses}/${dailyLimit} use${dailyLimit > 1 ? 's' : ''} left today`}
                      </span>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={isDisabled}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isDisabled
                          ? 'bg-white/5 text-white/25 cursor-not-allowed'
                          : 'bg-primary text-black hover:bg-primary/80 active:scale-95'
                      }`}
                    >
                      {isPurchasingThis ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Buying...</span>
                        </>
                      ) : isSoldOut ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Buy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Insufficient Credits Warning */}
                  {!isSoldOut && cannotAfford && (
                    <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 border border-destructive/30"
                      style={{ background: 'rgba(239, 68, 68, 0.08)' }}
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-destructive/80 shrink-0" />
                      <span className="text-xs text-destructive/80 font-medium">
                        Insufficient credits — need {creditCost - userCredits} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!cheatItems || cheatItems.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <ShoppingBag className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg">No items available</p>
        </div>
      )}
    </div>
  );
}
