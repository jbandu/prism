"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Settings,
  Package,
  GitCompare,
  FileText,
  Calendar,
  BarChart3,
  Layers,
  Brain,
  TrendingDown
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
    label: "Clients",
    icon: Building2,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
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
    href: `/${companyId}/portfolio-map`,
    label: "Portfolio Map",
    icon: Layers,
  },
  {
    href: `/${companyId}/analysis`,
    label: "AI Analysis",
    icon: Brain,
  },
  {
    href: `/${companyId}/alternatives`,
    label: "Alternatives",
    icon: GitCompare,
  },
  {
    href: `/${companyId}/redundancy`,
    label: "Redundancy Analysis",
    icon: TrendingDown,
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
  const { data: session } = useSession();
  const links = type === "admin" ? adminLinks : companyLinks(companyId || "");

  // Determine home link based on user session and context
  const getHomeLink = () => {
    if (!session?.user) {
      return "/";
    }

    const userRole = (session.user as any).role;
    const userCompanySlug = (session.user as any).companySlug;

    // If user is admin, go to admin dashboard
    if (userRole === "admin") {
      return "/admin/dashboard";
    }

    // If user is company_manager or viewer, go to their company's dashboard
    if ((userRole === "company_manager" || userRole === "viewer")) {
      // Prefer the current companyId (slug) from URL context, fallback to user's company slug
      const targetCompanySlug = companyId || userCompanySlug;
      if (targetCompanySlug) {
        return `/${targetCompanySlug}/dashboard`;
      }
    }

    // Default fallback
    return "/";
  };

  const homeLink = getHomeLink();

  return (
    <div className="w-64 bg-prism-dark border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <Link href={homeLink} className="flex items-center space-x-2">
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
