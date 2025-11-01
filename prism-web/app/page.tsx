import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-prism-dark via-prism-dark-700 to-prism-primary-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">
              PRISM
            </h1>
            <p className="text-2xl text-prism-secondary font-semibold">
              Portfolio Risk Intelligence & Savings Management
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              AI-powered enterprise software asset management and cost optimization platform
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-prism-primary hover:bg-prism-primary-600">
                Get Started
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-prism-dark">
                Admin Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Cost Optimization</CardTitle>
                <CardDescription className="text-gray-300">
                  Identify immediate savings opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-200">
                AI-powered analysis of license usage, tier optimization, and contract negotiation leverage
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Alternative Discovery</CardTitle>
                <CardDescription className="text-gray-300">
                  Find better, cheaper alternatives
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-200">
                Intelligent matching of software alternatives with feature comparison and migration planning
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Vendor Intelligence</CardTitle>
                <CardDescription className="text-gray-300">
                  Stay ahead of market changes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-200">
                Real-time monitoring of vendor health, market trends, and competitive landscape
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
