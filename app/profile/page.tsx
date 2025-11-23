"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  ArrowLeft,
  ExternalLink,
  Flame,
  Shield,
  Star,
  TrendingUp,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sellerStats = {
  totalEarned: 3280,
  pending: 420,
  buyers: 47,
  avgStars: 4.8,
  trustTags: ["fast replies", "deep research", "base native"],
};

const listings = [
  {
    id: 1,
    title: "Base Grant Pitch Kit",
    description: "Notion doc + loom script to secure Layer3 microgrants.",
    content:
      "Includes email copy, KPI narrative, and budget sheet template used to close 5 grants.",
    price_usd: 210,
    x402url: "https://warpcast.com/~/channel/base-grants/402?demo=1",
  },
  {
    id: 2,
    title: "Farcaster Growth Loop",
    description: "Day-by-day plan for hitting 5k recasts organically.",
    content:
      "Thread hooks, cast cadence, and collaborations tracker ready to duplicate.",
    price_usd: 148,
    x402url: "https://warpcast.com/~/channel/growth/402?demo=1",
  },
  {
    id: 3,
    title: "Brand Deal Tracker",
    description: "Sponsor pricing calculator for Base native creators.",
    content:
      "Spreadsheet with CPM logic, legal checklist, and negotiation scripts.",
    price_usd: 96,
    x402url: "https://warpcast.com/~/channel/ads/402?demo=1",
  },
];

export default function ProfilePage() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const initials = (context?.user?.displayName || "Builder")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-dvh justify-center bg-[#02040b] bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%)] px-3">
      <main className="flex w-full max-w-[420px] flex-col gap-5 pb-10 pt-6 text-white">
        <nav className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs uppercase tracking-[0.3em]"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Badge variant="glow" className="text-[11px]">
            Seller mode
          </Badge>
        </nav>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_15px_40px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-2xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                Seller
              </p>
              <h1 className="text-2xl font-semibold">
                {context?.user?.displayName || "Base power user"}
              </h1>
              <p className="text-xs text-white/60">
                FID: {context?.user?.fid ?? 99999}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {sellerStats.trustTags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-white/30 px-3">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <div className="grid gap-4">
          <Card className="border-white/10 bg-gradient-to-br from-blue-600/40 via-indigo-600/30 to-purple-600/40">
            <CardHeader className="space-y-1">
              <CardTitle>Earned amount</CardTitle>
              <CardDescription>Mock payout data from purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-semibold text-glow">
                ${sellerStats.totalEarned.toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>{sellerStats.buyers} buyers served</span>
                <span>${sellerStats.pending} pending</span>
              </div>
              <Button variant="secondary" className="w-full gap-2">
                <TrendingUp className="h-4 w-4" />
                Withdraw to wallet
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader className="space-y-1">
              <CardTitle>User stars</CardTitle>
              <CardDescription>Synthesized from seller_ratings table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-semibold">
                  {sellerStats.avgStars.toFixed(1)}
                </span>
                <div className="flex gap-1 text-yellow-300">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-5 w-5 ${idx < Math.round(sellerStats.avgStars) ? "fill-yellow-300 text-yellow-300" : "text-white/30"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <Flame className="h-4 w-4 text-orange-300" />
                  Speed 4.9
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <Shield className="h-4 w-4 text-emerald-300" />
                  Accuracy 4.8
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Listings</h2>
            <p className="text-sm text-white/60">
              Mock rows mapped from the `products` table.
            </p>
          </div>
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="border-white/10 bg-white/[0.035] p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                      product #{listing.id}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{listing.title}</h3>
                  </div>
                  <span className="text-lg font-semibold">
                    ${listing.price_usd}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">{listing.description}</p>
                <p className="mt-2 text-sm text-white/60">{listing.content}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    x402 url
                  </p>
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-3 py-2 text-sm">
                    <span className="truncate">{listing.x402url}</span>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-white/30 bg-transparent text-xs uppercase tracking-[0.3em]"
                    >
                      <a href={listing.x402url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

