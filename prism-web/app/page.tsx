import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  DollarSign,
  GitCompare,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  BarChart3,
  Calendar,
  Package,
  Users,
  CheckCircle,
  Sparkles,
  Target,
  Brain,
  Layers,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-prism-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-prism-dark">PRISM</h1>
                <p className="text-xs text-gray-500">Portfolio Intelligence Platform</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="lg" className="bg-prism-primary hover:bg-prism-primary/90 text-white">
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-prism-dark via-prism-dark to-prism-primary py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Badge className="bg-prism-secondary text-prism-dark px-4 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered SaaS Portfolio Management
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Optimize Your Software Spend<br />
              <span className="text-prism-secondary">Save Up to 40% Annually</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              PRISM uses advanced AI to analyze your entire software portfolio, identify waste,
              discover better alternatives, and negotiate optimal contracts—all in one intelligent platform.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-prism-secondary hover:bg-prism-secondary/90 text-prism-dark font-semibold text-lg h-14 px-8">
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-prism-dark font-semibold text-lg h-14 px-8 backdrop-blur">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-prism-secondary mb-2">$2.4M+</div>
                <div className="text-white font-medium">Average Savings Identified</div>
                <div className="text-sm text-gray-300 mt-1">Per enterprise client annually</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-prism-secondary mb-2">40%</div>
                <div className="text-white font-medium">Average Cost Reduction</div>
                <div className="text-sm text-gray-300 mt-1">Across software portfolio</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-prism-secondary mb-2">24 hrs</div>
                <div className="text-white font-medium">Complete Analysis</div>
                <div className="text-sm text-gray-300 mt-1">AI-powered insights delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl font-bold text-prism-dark mb-4">
              Everything You Need to Manage SaaS Spending
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI-powered tools to optimize your entire software portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Cost Optimization</CardTitle>
                <CardDescription>
                  Identify immediate savings opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>License usage analysis &amp; rightsizing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Tier optimization recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Contract negotiation leverage points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Waste detection &amp; elimination</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <GitCompare className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Alternative Discovery</CardTitle>
                <CardDescription>
                  Find better, cheaper solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered software matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Feature parity scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Migration complexity assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>ROI &amp; payback period calculations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Vendor Intelligence</CardTitle>
                <CardDescription>
                  Stay ahead of market changes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Financial health monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Market position analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Risk factor identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Competitive landscape insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Renewal Management</CardTitle>
                <CardDescription>
                  Never miss critical deadlines
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Automated renewal tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>AI renewal recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Contract action planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Negotiation strategy guidance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Portfolio Visualization</CardTitle>
                <CardDescription>
                  Executive-level insights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Interactive portfolio maps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Spend treemaps &amp; visualizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Category-based grouping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Multi-view dashboards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Reporting</CardTitle>
                <CardDescription>
                  Data-driven decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time spend tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Utilization analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Executive summary reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Custom report generation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI-Powered Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-prism-primary to-prism-dark">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <Badge className="bg-prism-secondary text-prism-dark px-4 py-2">
                <Brain className="w-4 h-4 mr-2 inline" />
                AI-Powered Intelligence
              </Badge>
              <h2 className="text-4xl font-bold">
                Your AI Agent for SaaS Optimization
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                PRISM&apos;s advanced AI continuously analyzes your software portfolio,
                market trends, and vendor landscape to deliver actionable insights and
                recommendations that drive real cost savings.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-prism-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-prism-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Automated Analysis</h3>
                    <p className="text-gray-300">Continuous portfolio monitoring and optimization recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-prism-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-prism-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Precise Matching</h3>
                    <p className="text-gray-300">AI-driven alternative discovery with 95%+ feature accuracy</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-prism-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-prism-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Real-Time Intelligence</h3>
                    <p className="text-gray-300">Live market data and vendor health tracking</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Potential Savings</p>
                      <p className="text-2xl font-bold text-green-600">$847,200</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">High</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Software Assets</p>
                      <p className="text-2xl font-bold text-blue-600">127</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Tracked</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <GitCompare className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Alternatives Found</p>
                      <p className="text-2xl font-bold text-purple-600">42</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">Recommended</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Renewals (30d)</p>
                      <p className="text-2xl font-bold text-yellow-600">8</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white">Action Required</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-prism-dark">
            Ready to Optimize Your Software Portfolio?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join leading enterprises that have saved millions by optimizing their SaaS spending with PRISM.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-prism-primary hover:bg-prism-primary/90 text-white font-semibold text-lg h-14 px-8">
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="border-2 border-prism-primary text-prism-primary hover:bg-prism-primary hover:text-white font-semibold text-lg h-14 px-8">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-prism-dark text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-prism-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-xl">PRISM</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered SaaS portfolio optimization platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 PRISM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
