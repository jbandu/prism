import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CompaniesPage() {
  const companies = [
    {
      id: "acme-corp",
      name: "Acme Corporation",
      industry: "Technology",
      employees: 500,
      softwareCount: 45,
      annualSpend: 320000,
      savings: 64000,
    },
    {
      id: "globex",
      name: "Globex Industries",
      industry: "Manufacturing",
      employees: 1200,
      softwareCount: 78,
      annualSpend: 580000,
      savings: 116000,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Companies</h1>
          <p className="text-gray-600 mt-2">
            Manage all companies and their software portfolios
          </p>
        </div>
        <Button className="bg-prism-primary hover:bg-prism-primary-600">
          Add Company
        </Button>
      </div>

      <div className="grid gap-6">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription>
                    {company.industry} · {company.employees} employees
                  </CardDescription>
                </div>
                <Link href={`/${company.id}/dashboard`}>
                  <Button variant="outline">View Dashboard</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Software Count</p>
                  <p className="text-2xl font-bold text-prism-dark">{company.softwareCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Spend</p>
                  <p className="text-2xl font-bold text-prism-dark">
                    ${(company.annualSpend / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(company.savings / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
