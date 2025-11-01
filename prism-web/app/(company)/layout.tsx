"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { usePathname } from "next/navigation";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Extract companyId from pathname (e.g., "/biorad/dashboard" -> "biorad")
  const companyId = pathname.split('/')[1] || '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="company" companyId={companyId} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
