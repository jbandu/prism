import { Sidebar } from "@/components/shared/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="admin" />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
