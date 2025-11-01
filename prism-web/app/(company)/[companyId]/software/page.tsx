import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SoftwarePage({
  params,
}: {
  params: { companyId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Software Portfolio</h1>
        <p className="text-gray-600 mt-2">
          View and manage all software subscriptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Software List</CardTitle>
          <CardDescription>All active software subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Software management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
