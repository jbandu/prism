import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, TrendingDown, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Companies",
      value: "12",
      icon: Building2,
      change: "+2 this month",
      color: "text-prism-primary",
    },
    {
      title: "Total Annual Spend",
      value: "$2.4M",
      icon: DollarSign,
      change: "Across all companies",
      color: "text-prism-secondary",
    },
    {
      title: "Total Savings Identified",
      value: "$480K",
      icon: TrendingDown,
      change: "20% reduction potential",
      color: "text-green-600",
    },
    {
      title: "Action Items",
      value: "28",
      icon: AlertTriangle,
      change: "Requiring attention",
      color: "text-prism-accent",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of all companies and software portfolios
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-prism-dark">{stat.value}</div>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Companies</CardTitle>
          <CardDescription>Companies managed in PRISM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Company management features coming soon...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
