"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
    ArrowLeft,
    Copy,
    Loader2,
    ShieldCheck,
    Tag,
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
import { getProductById } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/types";

type ProductWithSeller = Database['public']['Tables']['products']['Row'] & {
    sellers: { wallet: string } | null;
};

export default function ProductPage() {
    const params = useParams();
    const { isFrameReady, setFrameReady } = useMiniKit();
    const [product, setProduct] = useState<ProductWithSeller | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isFrameReady) {
            setFrameReady();
        }
    }, [isFrameReady, setFrameReady]);

    useEffect(() => {
        async function fetchProduct() {
            if (!params.id) return;
            try {
                const data = await getProductById(Number(params.id));
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProduct();
    }, [params.id]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#00040f]">
                <Loader2 className="h-8 w-8 animate-spin text-white/30" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#00040f] text-white">
                <p className="text-white/60">Product not found.</p>
                <Button asChild variant="secondary">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    const apiUrl = `${window.location.origin}/api/${product.sellers?.wallet}/${product.id}`;

    return (
        <div className="flex min-h-dvh justify-center bg-[#00040f] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)] px-3">
            <main className="flex w-full max-w-[420px] flex-col gap-6 pb-10 pt-6 text-white">
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
                        Product #{product.id}
                    </Badge>
                </nav>

                <section className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold leading-tight text-glow">
                            {product.title}
                        </h1>
                        <p className="mt-2 text-lg text-white/70">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                            <Tag className="h-3.5 w-3.5" />
                            ${product.price_usd} USD
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified Seller
                        </Badge>
                    </div>
                </section>

                <Card className="border-white/10 bg-white/[0.04]">
                    <CardHeader>
                        <CardTitle className="text-base">API Endpoint</CardTitle>
                        <CardDescription>
                            Share this URL to sell access to your content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="relative">
                            <Input
                                readOnly
                                value={apiUrl}
                                className="bg-black/40 border-white/10 pr-10 font-mono text-xs text-white/80"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-7 w-7 text-white/50 hover:text-white"
                                onClick={() => copyToClipboard(apiUrl)}
                            >
                                {copied ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-white/40">
                            Agents can POST to this URL to purchase and retrieve the content.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                    <CardHeader>
                        <CardTitle className="text-base">Preview Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                            <pre className="whitespace-pre-wrap font-mono text-xs text-white/60">
                                {product.content}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
