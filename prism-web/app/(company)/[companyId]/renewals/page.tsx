import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RenewalsPage({
  params,
}: {
  params: { companyId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Contract Renewals</h1>
        <p className="text-gray-600 mt-2">
          Manage upcoming renewals and negotiation strategies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>
            Track your contract renewals and take action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Renewals tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
