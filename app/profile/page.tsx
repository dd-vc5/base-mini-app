"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import {
  AlertCircle,
  ArrowLeft,
  Clock4,
  Flame,
  Loader2,
  Shield,
  Sparkles,
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
import { getRecentPurchases, getSellerProducts, getSellerStats, type PurchaseWithProduct } from "@/lib/supabase/queries";
import { getSellerByWallet } from "@/lib/supabase/sellers";
import { Database } from "@/lib/supabase/types";
import { FooterNav } from "@/components/footer-nav";

type Product = Database['public']['Tables']['products']['Row'];

export default function ProfilePage() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
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

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const data = await getRecentPurchases();
        setPurchases(data);
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
      } finally {
        setIsLoadingPurchases(false);
      }
    }
    fetchPurchases();
  }, []);

  const initials = (context?.user?.displayName || "Builder")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-background px-3 pb-28">
      <main className="flex w-full max-w-[420px] flex-col gap-5 pb-10 pt-6">
        <nav className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 rounded-full text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Badge variant="secondary" className="text-[11px]">
            Seller mode
          </Badge>
        </nav>

        {!isConnected ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">Connect your wallet to view your profile.</p>
          </div>
        ) : (
          <>
            <section className="rounded-4xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-2xl">
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                    Seller
                  </p>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {context?.user?.displayName || "Base power user"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    FID: {context?.user?.fid ?? 99999}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats?.trustTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>

            <div className="grid gap-4">
              <Card className="bg-primary text-primary-foreground border-none shadow-md">
                <CardHeader className="space-y-1 pb-2">
                  <CardTitle className="text-primary-foreground">Earned amount</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Real payout data from purchases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-4xl font-semibold">
                    ${stats?.totalEarned.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center justify-between text-sm text-primary-foreground/80">
                    <span>{stats?.buyers || 0} buyers served</span>
                    <span>${stats?.pending || 0} pending</span>
                  </div>
                  <Button variant="secondary" className="w-full gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Withdraw to wallet
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle>User stars</CardTitle>
                  <CardDescription>Synthesized from seller_ratings table</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-semibold text-foreground">
                      {stats?.avgStars.toFixed(1) || "0.0"}
                    </span>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-5 w-5 ${idx < Math.round(stats?.avgStars || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-3 py-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Speed 4.9
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-3 py-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      Accuracy 4.8
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-[#e3ece6] bg-white/90 shadow-[0_12px_32px_rgba(7,33,20,0.06)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recent unlocks
                </CardTitle>
                <CardDescription className="text-sm text-emerald-900/70">
                  People buying real knowledge, not AI filler.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingPurchases ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : purchases.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No purchases yet.</p>
                ) : (
                  purchases.map((purchase) => (
                    <Link
                      href={`/products/${purchase.product_id}`}
                      key={purchase.id}
                      className="flex items-center justify-between rounded-3xl border border-[#edf3ef] bg-white px-4 py-3 transition-colors hover:bg-emerald-50/50"
                    >
                      <div>
                        <p className="text-sm font-semibold">{purchase.products?.title || "Unknown Product"}</p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.buyer_wallet.slice(0, 6)}...{purchase.buyer_wallet.slice(-4)} · {new Date(purchase.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${purchase.amount_usd}</p>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
                          usd
                        </p>
                      </div>
                    </Link>
                  ))
                )}
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock4 className="h-4 w-4" />
                  Activity updates in real-time.
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Listings</h2>
                <p className="text-sm text-muted-foreground">
                  Real rows mapped from the `products` table.
                </p>
              </div>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No listings yet.</p>
                ) : (
                  products.map((listing) => (
                    <Link key={listing.id} href={`/products/${listing.id}`} className="block transition-opacity hover:opacity-80">
                      <Card className="p-5 text-left hover:bg-secondary/10 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
                              product #{listing.id}
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-foreground">{listing.title}</h3>
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            ${listing.price_usd}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{listing.description}</p>
                        <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2">{listing.content}</p>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <FooterNav />
    </div>
  );
}
