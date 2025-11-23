"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  Flame,
  Shield,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
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
import { getSellerProducts, getSellerStats } from "@/lib/supabase/queries";
import { getSellerByWallet } from "@/lib/supabase/sellers";
import { Database } from "@/lib/supabase/types";

type Product = Database['public']['Tables']['products']['Row'];

export default function ProfilePage() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<{
    totalEarned: number;
    pending: number;
    buyers: number;
    avgStars: number;
    trustTags: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    async function fetchData() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        const seller = await getSellerByWallet(address);
        if (seller) {
          const [productsData, statsData] = await Promise.all([
            getSellerProducts(seller.id),
            getSellerStats(seller.id),
          ]);
          setProducts(productsData || []);
          setStats(statsData);
        } else {
          // Seller not found for this wallet
          setProducts([]);
          setStats(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [address]);

  const initials = (context?.user?.displayName || "Builder")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#02040b]">
        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
      </div>
    );
  }

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

        {!isConnected ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-white/30" />
            <p className="text-white/60">Connect your wallet to view your profile.</p>
          </div>
        ) : (
          <>
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
                {stats?.trustTags.map((tag) => (
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
                  <CardDescription>Real payout data from purchases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-4xl font-semibold text-glow">
                    ${stats?.totalEarned.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>{stats?.buyers || 0} buyers served</span>
                    <span>${stats?.pending || 0} pending</span>
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
                      {stats?.avgStars.toFixed(1) || "0.0"}
                    </span>
                    <div className="flex gap-1 text-yellow-300">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-5 w-5 ${idx < Math.round(stats?.avgStars || 0) ? "fill-yellow-300 text-yellow-300" : "text-white/30"}`}
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
                  Real rows mapped from the `products` table.
                </p>
              </div>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-center text-sm text-white/40 py-8">No listings yet.</p>
                ) : (
                  products.map((listing) => (
                    <Link key={listing.id} href={`/products/${listing.id}`} className="block transition-opacity hover:opacity-80">
                      <Card className="border-white/10 bg-white/[0.035] p-5 text-left">
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
                        <p className="mt-2 text-sm text-white/60 line-clamp-2">{listing.content}</p>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

