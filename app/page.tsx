"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { AlertCircle, BadgePlus, Loader2 } from "lucide-react";

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
import { createProduct } from "@/lib/supabase/queries";
import { createSeller, getSellerByWallet } from "@/lib/supabase/sellers";
import { FooterNav } from "@/components/footer-nav";

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

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);


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
    <div className="relative flex min-h-dvh justify-center bg-white px-3 pb-28 bg-[radial-gradient(circle_at_top,rgba(0,222,115,0.18),transparent_60%)]">
      <main className="flex w-full max-w-[460px] flex-col gap-6 pb-10 pt-6">
        <header className="relative overflow-hidden rounded-[2.25rem] border border-[#e3ece6] bg-white px-5 pb-5 pt-6 text-foreground shadow-[0_18px_40px_rgba(7,33,20,0.08)]">
          <div className="mb-5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800/60">
            <span>alpha.markets</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-emerald-950">
            Monetize the specific knowledge you live every day.
          </h1>
          {/* <p className="mt-3 text-sm text-emerald-900/80">
            alpha.markets lets anyone package their alpha—market calls, niche playbooks, or neighborhood know-how—and sell it directly to people who value it.
          </p> */}

          {!isConnected && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#fde2e2] bg-[#fff5f5] px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Connect your wallet to publish your next drop.</span>
            </div>
          )}

          {/* <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-1 text-sm"
            >
              <Link href="/profile">Profile & earnings</Link>
            </Button>
            <Button size="sm" className="flex-[1.3] gap-1">
              Share invite
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div> */}
        </header>

        <Card className="border border-[#e3ece6] bg-white/90 shadow-[0_12px_32px_rgba(7,33,20,0.06)]">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-emerald-950">What do you want to sell?</CardTitle>
              <Badge variant="glow" className="text-[11px] font-semibold uppercase tracking-[0.3em]">
                {completionScore}% ready
              </Badge>
            </div>
            <CardDescription className="text-sm text-emerald-900/70">
              Tell buyers what they unlock. Keep it straightforward and human.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Title</label>
                <Input
                  placeholder="Weekly housing alpha — Austin"
                  value={draft.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-secondary/20 border-input text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Description</label>
                <Input
                  placeholder="What's the headline insight?"
                  value={draft.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-secondary/20 border-input text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Content</label>
                <Textarea
                  placeholder="Share the key steps, files, or proof you are including."
                  value={draft.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="bg-secondary/20 border-input text-foreground placeholder:text-muted-foreground/50 min-h-[80px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Price (USD)</label>
                <Input
                  type="number"
                  placeholder="$99"
                  value={draft.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="bg-secondary/20 border-input text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={isCreating || !isConnected}
              className="w-full gap-2"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePlus className="h-4 w-4" />}
              {isCreating ? "Creating..." : "Monetize"}
            </Button>
            {status === "saving" && (
              <p className="text-center text-xs text-muted-foreground">
                Saving...
              </p>
            )}
            {status === "done" && (
              <p className="text-center text-xs text-emerald-600">
                Drop saved. Publish it from your profile when you are ready.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-xs text-destructive">
                {draft.title && draft.description && draft.content && draft.price ? "Failed to create drop. Please try again." : "Please fill in all fields."}
              </p>
            )}
          </CardContent>
        </Card>

      </main>
      <FooterNav />
    </div>
  );
}
