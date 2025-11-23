"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Create", icon: PenSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function FooterNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-[420px] items-center gap-2 rounded-full border border-emerald-100 bg-white/95 p-1.5 shadow-[0_-8px_24px_rgba(9,27,16,0.12)] backdrop-blur-md">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-900 hover:bg-emerald-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </footer>
  );
}

