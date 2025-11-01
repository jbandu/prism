import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, AlertCircle, Package } from "lucide-react";

export default function CompanyDashboard({
  params,
}: {
  params: { companyId: string };
}) {
  const metrics = [
    {
      title: "Total Software",
      value: "45",
      icon: Package,
      change: "+3 this quarter",
      color: "text-prism-primary",
    },
    {
      title: "Annual Spend",
      value: "$320K",
      icon: DollarSign,
      change: "Current contracts",
      color: "text-prism-secondary",
    },
    {
      title: "Potential Savings",
      value: "$64K",
      icon: TrendingDown,
      change: "20% reduction",
      color: "text-green-600",
    },
    {
      title: "Underutilized",
      value: "12",
      icon: AlertCircle,
      change: "<50% usage",
      color: "text-prism-accent",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark capitalize">
          {params.companyId.replace(/-/g, " ")} Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Software portfolio overview and optimization opportunities
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-prism-dark">{metric.value}</div>
                <p className="text-sm text-gray-500 mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Cost Optimization Opportunities</CardTitle>
            <CardDescription>Immediate savings available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Salesforce</p>
                  <p className="text-sm text-gray-600">25 unused licenses</p>
                </div>
                <p className="font-bold text-green-600">$15K/yr</p>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Adobe Creative Cloud</p>
                  <p className="text-sm text-gray-600">Tier downgrade possible</p>
                </div>
                <p className="font-bold text-green-600">$8K/yr</p>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-gray-600">10 inactive users</p>
                </div>
                <p className="font-bold text-green-600">$1.2K/yr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Recommendations</CardTitle>
            <CardDescription>Better options available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Zoom → Google Meet</p>
                  <p className="text-sm text-gray-600">95% feature match</p>
                </div>
                <p className="font-bold text-green-600">$12K/yr</p>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Asana → ClickUp</p>
                  <p className="text-sm text-gray-600">Better value tier</p>
                </div>
                <p className="font-bold text-green-600">$6K/yr</p>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">DocuSign → Adobe Sign</p>
                  <p className="text-sm text-gray-600">Bundle savings</p>
                </div>
                <p className="font-bold text-green-600">$4K/yr</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
