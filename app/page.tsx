"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  ArrowRight,
  BadgePlus,
  Bolt,
  ChevronRight,
  Clock4,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DraftField = "title" | "description" | "content" | "price";

const fieldMeta: Record<
  DraftField,
  { label: string; placeholder: string; helper: string }
> = {
  title: {
    label: "Title",
    placeholder: "tap to drop a headline 🔥",
    helper: "What are you selling in one brutalist sentence?",
  },
  description: {
    label: "Description",
    placeholder: "sketch the problem in 2 lines",
    helper: "Why would a builder pay for this alpha?",
  },
  content: {
    label: "Content",
    placeholder: "thread outline, repo notes, back channel...",
    helper: "Paste the signal that only insiders know.",
  },
  price: {
    label: "Price (USD)",
    placeholder: "$99 · premium drop",
    helper: "Buyers expect $30 - $250 for verified insights.",
  },
};

const templateNeeds = [
  {
    buyer_wallet: "0xba5e...d00r",
    buyer_fid: 90211,
    ask: "Need playbook for closing brand deals with Base grants.",
    bounty: 180,
  },
  {
    buyer_wallet: "0x7ca1...fade",
    buyer_fid: 12345,
    ask: "Looking for Farcaster growth loop that hit 5k recasts.",
    bounty: 240,
  },
];

const recentPurchases = [
  {
    buyer_wallet: "0xf00d...beef",
    title: "Cross-chain drip tool stack",
    amount_usd: 72,
    created_at: "8 min ago",
  },
  {
    buyer_wallet: "0x1a2b...9c0d",
    title: "Sponsored cast pricing sheet",
    amount_usd: 110,
    created_at: "25 min ago",
  },
];

export default function Home() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const [draft, setDraft] = useState<Record<DraftField, string>>({
    title: "",
    description: "",
    content: "",
    price: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const completionScore = useMemo(() => {
    const filled = Object.values(draft).filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  }, [draft]);

  const handleFieldEdit = (field: DraftField) => {
    if (typeof window === "undefined") return;
    const currentValue = draft[field];
    const nextValue = window.prompt(
      `${fieldMeta[field].label}`,
      currentValue || "",
    );
    if (nextValue !== null) {
      setDraft((prev) => ({ ...prev, [field]: nextValue.trim() }));
      setStatus("idle");
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setStatus("saving");
    setTimeout(() => {
      setIsCreating(false);
      setStatus("done");
    }, 1200);
  };

  return (
    <div className="flex min-h-dvh justify-center bg-[#00040f] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_55%)] px-3">
      <main className="flex w-full max-w-[420px] flex-col gap-6 pb-10 pt-6">
        <header className="glass relative overflow-hidden rounded-[2.25rem] border border-white/10 px-5 pb-5 pt-6 text-white shadow-[0_15px_45px_rgba(15,23,42,0.55)]">
          <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
            <span>signal.market</span>
            <span>beta</span>
          </div>
          <p className="text-sm text-white/70">
            Hey {context?.user?.displayName || "explorer"}, welcome back.
          </p>
          <h1 className="text-glow mt-2 text-3xl font-semibold leading-tight">
            Drop exclusive knowledge bites for Base builders.
          </h1>
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/15 text-sm"
            >
              <Link href="/profile">Profile & earnings</Link>
            </Button>
            <Button size="sm" className="flex-[1.3] gap-1">
              Share invite
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Card className="border-white/5 bg-white/[0.04]">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Create a knowledge drop</CardTitle>
              <Badge variant="glow" className="text-[11px]">
                {completionScore}% ready
              </Badge>
            </div>
            <CardDescription>
              Tap a row to sketch the drop. No heavy forms — just quick
              placeholders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              Object.keys(fieldMeta) as Array<DraftField>
            ).map((field: DraftField) => (
              <FieldRow
                key={field}
                label={fieldMeta[field].label}
                placeholder={fieldMeta[field].placeholder}
                helper={fieldMeta[field].helper}
                value={draft[field]}
                onClick={() => handleFieldEdit(field)}
              />
            ))}

            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full gap-2"
            >
              <BadgePlus className="h-4 w-4" />
              {isCreating ? "Minting…" : "Create drop"}
            </Button>
            {status === "saving" && (
              <p className="text-center text-xs text-white/70">
                Saving mock data to the products table…
              </p>
            )}
            {status === "done" && (
              <p className="text-center text-xs text-emerald-300">
                Drop staged. Head to profile to publish to buyers.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.035]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bolt className="h-4 w-4 text-yellow-300" />
              Buyers currently need
            </CardTitle>
            <CardDescription>
              Mock data mapped from the `purchases` + `products` schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templateNeeds.map((need) => (
              <div
                key={need.buyer_wallet}
                className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                  <span>FID {need.buyer_fid}</span>
                  <span>{need.buyer_wallet}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white">
                  {need.ask}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-white/60">Bounty</span>
                  <span className="text-lg font-semibold">${need.bounty}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-blue-300" />
              Fresh purchases
            </CardTitle>
            <CardDescription>
              Social proof for your drop. Mock entries from `purchases`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPurchases.map((purchase) => (
              <div
                key={purchase.buyer_wallet}
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{purchase.title}</p>
                  <p className="text-xs text-white/60">
                    {purchase.buyer_wallet} · {purchase.created_at}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${purchase.amount_usd}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                    usd
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-1 text-xs text-white/60">
              <Clock4 className="h-4 w-4" />
              Updates every minute once connected to Base.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

type FieldRowProps = {
  label: string;
  placeholder: string;
  helper: string;
  value?: string;
  onClick?: () => void;
};

function FieldRow({ label, placeholder, helper, value, onClick }: FieldRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-3 text-left transition hover:border-white/40"
    >
      <div className="text-[11px] uppercase tracking-[0.4em] text-white/40">
        {label}
      </div>
      <p
        className={`mt-1 text-base ${value ? "text-white" : "text-white/40 italic"}`}
      >
        {value || placeholder}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
        <span>{helper}</span>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </div>
    </button>
  );
}
