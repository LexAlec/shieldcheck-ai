"use client";

import Link from "next/link";
import { ShieldCheck, History, BookOpen, Crown, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Início" },
    { href: "/history", icon: History, label: "Histórico" },
    { href: "/education", icon: BookOpen, label: "Aprender" },
    { href: "/premium", icon: Crown, label: "Premium" },
  ];

  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
