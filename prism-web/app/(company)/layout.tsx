import { Sidebar } from "@/components/shared/sidebar";

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companyId: string };
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="company" companyId={params.companyId} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
