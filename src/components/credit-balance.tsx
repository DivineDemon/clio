"use client";

import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Progress } from "./ui/progress";

export function CreditBalance() {
  const { data: user, isLoading } = api.payment.getCredits.useQuery();
  const createCheckoutSession = api.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url as string;
    },
    onError: (error) => {
      toast.error("Failed to start payment", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (!user) return null;

  const totalFree = 2;
  const freeUsed = user.freeGenerationsUsed;
  const freeRemaining = Math.max(0, totalFree - freeUsed);
  const credits = user.credits;

  const isFreeTier = credits === 0;

  const handleBuyCredits = () => {
    createCheckoutSession.mutate();
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm transition-all hover:bg-accent/5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Balance</span>
        </div>
        {isFreeTier ? (
          <span className="font-medium text-green-600 text-xs dark:text-green-400">Free Tier</span>
        ) : (
          <span className="font-medium text-blue-600 text-xs dark:text-blue-400">Pro</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Free Generations</span>
            <span className={freeUsed >= totalFree ? "font-medium text-destructive" : ""}>
              {Math.min(freeUsed, totalFree)} / {totalFree}
            </span>
          </div>
          <Progress value={(Math.min(freeUsed, totalFree) / totalFree) * 100} className="h-1.5" />
        </div>

        {(credits > 0 || freeRemaining === 0) && (
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground text-xs">Available Credits</span>
            <span className="font-bold text-lg">{credits}</span>
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={freeRemaining > 0 && credits === 0 ? "outline" : "default"}
              size="sm"
              className="w-full text-xs"
            >
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              {credits > 0 ? "Buy More Credits" : "Refill Credits"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add README Credits</DialogTitle>
              <DialogDescription>
                Purchase credits to generate more high-quality READMEs. Each credit allows for one generation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">1 Credit</div>
                  <div className="text-muted-foreground text-sm">Generate 1 premium README</div>
                </div>
                <div className="font-bold text-xl">$5.00</div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleBuyCredits}
                disabled={createCheckoutSession.isPending}
                className="w-full sm:w-auto"
              >
                {createCheckoutSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceed to Checkout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
