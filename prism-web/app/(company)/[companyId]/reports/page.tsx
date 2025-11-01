import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage({
  params,
}: {
  params: { companyId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Reports</h1>
        <p className="text-gray-600 mt-2">
          Executive summaries and detailed analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate comprehensive software portfolio reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Report generation features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
