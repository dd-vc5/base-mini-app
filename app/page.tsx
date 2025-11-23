"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import {
  ArrowRight,
  BadgePlus,
  Clock4,
  Sparkles,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, getRecentPurchases, type PurchaseWithProduct } from "@/lib/supabase/queries";
import { getSellerByWallet, createSeller } from "@/lib/supabase/sellers";

type DraftField = "title" | "description" | "content" | "price";

export default function Home() {
  const router = useRouter();
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [draft, setDraft] = useState<Record<DraftField, string>>({
    title: "",
    description: "",
    content: "",
    price: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

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

  const completionScore = useMemo(() => {
    const filled = Object.values(draft).filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  }, [draft]);

  const handleChange = (field: DraftField, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setStatus("idle");
  };

  const handleCreate = async () => {
    if (!draft.title || !draft.description || !draft.content || !draft.price) {
      setStatus("error");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsCreating(true);
    setStatus("saving");

    try {
      // 1. Get or Create Seller
      let seller = await getSellerByWallet(address);
      if (!seller) {
        seller = await createSeller({
          wallet: address,
          fid: context?.user?.fid || null,
        });
      }

      if (!seller) throw new Error("Failed to get/create seller");

      // 2. Create Product
      const newProduct = await createProduct({
        title: draft.title,
        description: draft.description,
        content: draft.content,
        price_usd: parseFloat(draft.price),
        seller_id: seller.id,
      });
      setStatus("done");
      setDraft({ title: "", description: "", content: "", price: "" });
      if (newProduct) {
        router.push(`/products/${newProduct.id}`);
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setStatus("error");
    } finally {
      setIsCreating(false);
    }
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

          {!isConnected && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="h-4 w-4" />
              <span>Wallet not connected. Connect to create drops.</span>
            </div>
          )}

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
              Sketch the drop. No heavy forms — just quick placeholders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-white/40">Title</label>
                <Input
                  placeholder="tap to drop a headline 🔥"
                  value={draft.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-white/[0.025] border-white/10 text-white placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-white/40">Description</label>
                <Input
                  placeholder="sketch the problem in 2 lines"
                  value={draft.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-white/[0.025] border-white/10 text-white placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-white/40">Content</label>
                <Textarea
                  placeholder="thread outline, repo notes, back channel..."
                  value={draft.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="bg-white/[0.025] border-white/10 text-white placeholder:text-white/20 min-h-[80px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-white/40">Price (USD)</label>
                <Input
                  type="number"
                  placeholder="$99 · premium drop"
                  value={draft.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="bg-white/[0.025] border-white/10 text-white placeholder:text-white/20"
                />
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={isCreating || !isConnected}
              className="w-full gap-2"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePlus className="h-4 w-4" />}
              {isCreating ? "Minting…" : "Create drop"}
            </Button>
            {status === "saving" && (
              <p className="text-center text-xs text-white/70">
                Saving to Supabase…
              </p>
            )}
            {status === "done" && (
              <p className="text-center text-xs text-emerald-300">
                Drop staged. Head to profile to publish to buyers.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-xs text-red-400">
                {draft.title && draft.description && draft.content && draft.price ? "Failed to create drop. Please try again." : "Please fill in all fields."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-blue-300" />
              Fresh purchases
            </CardTitle>
            <CardDescription>
              Social proof for your drop. Real entries from `purchases`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingPurchases ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-center text-sm text-white/40 py-4">No purchases yet.</p>
            ) : (
              purchases.map((purchase) => (
                <Link
                  href={`/products/${purchase.product_id}`}
                  key={purchase.id}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                >
                  <div>
                    <p className="text-sm font-semibold">{purchase.products?.title || "Unknown Product"}</p>
                    <p className="text-xs text-white/60">
                      {purchase.buyer_wallet.slice(0, 6)}...{purchase.buyer_wallet.slice(-4)} · {new Date(purchase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${purchase.amount_usd}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                      usd
                    </p>
                  </div>
                </Link>
              ))
            )}
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
