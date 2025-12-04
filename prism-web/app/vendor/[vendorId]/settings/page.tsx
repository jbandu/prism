"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  CreditCard,
  Users,
  Key,
  Bell,
  Shield,
  Check,
  Zap,
  Crown,
  ArrowRight,
  Plus,
  Copy,
  Trash2
} from "lucide-react";
import { useParams } from "next/navigation";

const subscriptionPlans = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Basic profile", "Category listing", "Limited analytics"],
    current: true,
  },
  {
    tier: "growth",
    name: "Growth",
    price: "$500",
    period: "/month",
    features: [
      "Customer visibility",
      "Basic analytics",
      "10 intro requests/month",
      "Campaign management",
    ],
    highlighted: false,
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$2,000",
    period: "/month",
    features: [
      "Everything in Growth",
      "Prospect discovery",
      "Market intelligence",
      "50 intro requests/month",
      "Advanced analytics",
    ],
    highlighted: true,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: "$10,000",
    period: "/month",
    features: [
      "Everything in Pro",
      "Unlimited intros",
      "API access",
      "Dedicated CSM",
      "Custom integrations",
    ],
    highlighted: false,
  },
];

export default function VendorSettings() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [notifications, setNotifications] = useState({
    new_prospect: true,
    intro_accepted: true,
    campaign_performance: true,
    renewal_alerts: true,
    weekly_digest: false,
  });

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription, team, and preferences
        </p>
      </div>

      {/* SUBSCRIPTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Subscription Plan
          </CardTitle>
          <CardDescription>
            Choose the plan that fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.tier}
                className={`relative p-4 rounded-lg border-2 ${
                  plan.highlighted
                    ? "border-prism-primary bg-blue-50"
                    : plan.current
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-2 right-2 bg-prism-primary">
                    Most Popular
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-2 right-2 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-4 ${
                    plan.current ? "bg-green-600" : plan.highlighted ? "" : "bg-gray-600"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BILLING */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Billing
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium">No payment method</p>
                  <p className="text-sm text-gray-500">Add a card to upgrade</p>
                </div>
              </div>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TEAM MEMBERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage who can access your vendor portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-prism-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">Y</span>
                </div>
                <div>
                  <p className="font-medium">You (Owner)</p>
                  <p className="text-sm text-gray-500">Full access</p>
                </div>
              </div>
              <Badge>Owner</Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API KEYS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-600" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for integrations (Pro plan and above)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium font-mono text-sm">pk_live_****</p>
                  <p className="text-sm text-gray-500">Created Dec 1, 2024</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Generate New API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NOTIFICATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Prospects</p>
                <p className="text-sm text-gray-500">When new prospects match your criteria</p>
              </div>
              <Switch
                checked={notifications.new_prospect}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, new_prospect: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Introduction Accepted</p>
                <p className="text-sm text-gray-500">When a client accepts your intro request</p>
              </div>
              <Switch
                checked={notifications.intro_accepted}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, intro_accepted: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campaign Performance</p>
                <p className="text-sm text-gray-500">Daily campaign performance updates</p>
              </div>
              <Switch
                checked={notifications.campaign_performance}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, campaign_performance: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Renewal Alerts</p>
                <p className="text-sm text-gray-500">When customer renewals are approaching</p>
              </div>
              <Switch
                checked={notifications.renewal_alerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, renewal_alerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-gray-500">Weekly summary of activity</p>
              </div>
              <Switch
                checked={notifications.weekly_digest}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weekly_digest: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
