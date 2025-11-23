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
            <div className="flex min-h-dvh items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-foreground">
                <p className="text-muted-foreground">Product not found.</p>
                <Button asChild variant="secondary">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    const apiUrl = `${window.location.origin}/api/${product.sellers?.wallet}/${product.id}`;

    return (
        <div className="flex min-h-dvh justify-center bg-background px-3">
            <main className="flex w-full max-w-[420px] flex-col gap-6 pb-10 pt-6">
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
                        Product #{product.id}
                    </Badge>
                </nav>

                <section className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold leading-tight text-foreground">
                            {product.title}
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                            <Tag className="h-3.5 w-3.5" />
                            ${product.price_usd} USD
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified Seller
                        </Badge>
                    </div>
                </section>

                <Card className="bg-card border-border shadow-sm">
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
                                className="bg-secondary/20 border-input pr-10 font-mono text-xs text-muted-foreground"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(apiUrl)}
                            >
                                {copied ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground/70">
                            Agents can POST to this URL to purchase and retrieve the content.
                        </p>
                    </CardContent>
                </Card>

                {/* <Card className="bg-secondary/10 border-border shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Preview Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                                {product.content}
                            </pre>
                        </div>
                    </CardContent>
                </Card> */}
            </main>
        </div>
    );
}
