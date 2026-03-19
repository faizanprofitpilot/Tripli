"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PRO_PLAN_LABEL, FAIR_USE_DISCLAIMER } from "@/lib/billing-constants";

type SubscriptionGateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubscriptionGateDialog({ open, onOpenChange }: SubscriptionGateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg">Upgrade to Tripli Pro</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            Your first trip is on us. For more AI-generated itineraries, subscribe to{" "}
            <span className="font-semibold text-foreground">Tripli Pro</span> at{" "}
            <span className="font-semibold text-foreground">{PRO_PLAN_LABEL}</span> with unlimited
            generations.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground leading-snug">
          {FAIR_USE_DISCLAIMER}
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <CheckoutButton className="w-full rounded-full font-semibold shadow-primary">
            Continue to checkout
          </CheckoutButton>
          <Link
            href="/pricing"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View pricing & details
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
