"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Settings,
  Package,
  GitCompare,
  FileText,
  Calendar
} from "lucide-react";

interface SidebarProps {
  type: "admin" | "company";
  companyId?: string;
}

const adminLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/companies",
    label: "Companies",
    icon: Building2,
  },
];

const companyLinks = (companyId: string) => [
  {
    href: `/${companyId}/dashboard`,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: `/${companyId}/software`,
    label: "Software Inventory",
    icon: Package,
  },
  {
    href: `/${companyId}/alternatives`,
    label: "Alternatives",
    icon: GitCompare,
  },
  {
    href: `/${companyId}/renewals`,
    label: "Renewals",
    icon: Calendar,
  },
  {
    href: `/${companyId}/reports`,
    label: "Reports",
    icon: FileText,
  },
  {
    href: `/${companyId}/settings`,
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({ type, companyId }: SidebarProps) {
  const pathname = usePathname();
  const links = type === "admin" ? adminLinks : companyLinks(companyId || "");

  return (
    <div className="w-64 bg-prism-dark border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-prism-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-white font-bold text-xl">PRISM</span>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-prism-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
