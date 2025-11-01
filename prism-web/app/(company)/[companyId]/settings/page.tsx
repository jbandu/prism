import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage({
  params,
}: {
  params: { companyId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure company preferences and integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>Manage your company configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Settings features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
