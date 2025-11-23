"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useConnect } from "wagmi";
import { User, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function FarcasterProfileHeader() {
  const { context } = useMiniKit();
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const user = context?.user;
  const isFarcasterConnected = !!user?.fid;
  
  // Generate initials from display name
  const initials = (user?.displayName || "User")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Try to get profile picture URL (Farcaster profile pictures are typically available via Neynar or Warpcast)
  const pfpUrl = user?.pfpUrl || (user?.fid ? `https://warpcast.com/avatar/${user.fid}` : null);

  const handleConnect = () => {
    // In a MiniApp, Farcaster connection is automatic when opened in Farcaster client
    // This button primarily handles wallet connection
    if (!isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  if (!isFarcasterConnected) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-[#e3ece6] bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(7,33,20,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <User className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-950">Not connected</p>
            <p className="text-xs text-emerald-700/70">Connect to Farcaster</p>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          size="sm"
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <LogIn className="h-4 w-4" />
          Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#e3ece6] bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(7,33,20,0.04)]">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-xl border border-emerald-200">
          {pfpUrl && <AvatarImage src={pfpUrl} alt={user.displayName || "Profile"} />}
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            {user?.displayName || "Farcaster User"}
          </p>
          <p className="text-xs text-emerald-700/70">
            FID: {user?.fid}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        <span className="text-xs text-emerald-700/70">Connected</span>
      </div>
    </div>
  );
}

