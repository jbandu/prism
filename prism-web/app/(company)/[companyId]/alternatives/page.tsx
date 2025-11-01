import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlternativesPage({
  params,
}: {
  params: { companyId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Software Alternatives</h1>
        <p className="text-gray-600 mt-2">
          AI-powered alternative software recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alternative Recommendations</CardTitle>
          <CardDescription>Better, cheaper alternatives to your current software</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Alternative discovery features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
