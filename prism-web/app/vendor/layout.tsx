"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { usePathname } from "next/navigation";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Extract vendorId from pathname (e.g., "/vendor/salesforce/overview" -> "salesforce")
  const pathParts = pathname.split('/');
  const vendorId = pathParts[2] || '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="vendor" vendorId={vendorId} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
