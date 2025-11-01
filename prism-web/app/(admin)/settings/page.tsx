"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Mail,
  Bot,
  Palette,
  Users,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check
} from "lucide-react";

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (keyName: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-prism-dark">Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform settings and integrations</p>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage API keys for external integrations</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showApiKeys ? "Hide" : "Show"} Keys
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">OpenAI API Key</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {showApiKeys ? "sk-proj-abc123...xyz789" : "••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">Active</Badge>
                {showApiKeys && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey("openai", "sk-proj-abc123xyz789")}
                  >
                    {copiedKey === "openai" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">Anthropic API Key</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {showApiKeys ? "sk-ant-api03-def456...uvw012" : "••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">Active</Badge>
                {showApiKeys && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey("anthropic", "sk-ant-api03-def456uvw012")}
                  >
                    {copiedKey === "anthropic" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">SendGrid API Key</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {showApiKeys ? "SG.ghi789...rst345" : "••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">Active</Badge>
                {showApiKeys && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey("sendgrid", "SG.ghi789rst345")}
                  >
                    {copiedKey === "sendgrid" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <Label className="text-sm font-medium">Neon Database Connection</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {showApiKeys ? "postgresql://user:pass@ep-xyz.neon.tech/prism" : "••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
                {showApiKeys && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey("neon", "postgresql://connection-string")}
                  >
                    {copiedKey === "neon" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Key className="w-4 h-4 mr-2" />
            Add New API Key
          </Button>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Templates
          </CardTitle>
          <CardDescription>Customize email templates for client communications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">Welcome Email</p>
              <p className="text-sm text-gray-500">Sent when new client is onboarded</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">Weekly Report</p>
              <p className="text-sm text-gray-500">Automated weekly portfolio summary</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">Savings Alert</p>
              <p className="text-sm text-gray-500">Notification when new savings are identified</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">Renewal Reminder</p>
              <p className="text-sm text-gray-500">Alert for upcoming contract renewals</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Agent Configuration
          </CardTitle>
          <CardDescription>Configure AI analysis parameters and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="analysisFrequency">Analysis Frequency</Label>
              <select
                id="analysisFrequency"
                className="w-full border rounded-md p-2 mt-1"
                defaultValue="weekly"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>

            <div>
              <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
              <select
                id="confidenceThreshold"
                className="w-full border rounded-md p-2 mt-1"
                defaultValue="medium"
              >
                <option value="high">High (90%+)</option>
                <option value="medium">Medium (70%+)</option>
                <option value="low">Low (50%+)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="maxAlternatives">Max Alternatives per Software</Label>
              <Input
                id="maxAlternatives"
                type="number"
                defaultValue={5}
                min={1}
                max={10}
              />
            </div>

            <div>
              <Label htmlFor="savingsThreshold">Minimum Savings Threshold</Label>
              <Input
                id="savingsThreshold"
                type="number"
                placeholder="e.g., 5000"
                defaultValue={5000}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <input type="checkbox" id="autoNotify" defaultChecked className="w-4 h-4" />
            <Label htmlFor="autoNotify" className="text-sm cursor-pointer">
              Automatically notify clients when significant savings are identified
            </Label>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <input type="checkbox" id="vendorRisk" defaultChecked className="w-4 h-4" />
            <Label htmlFor="vendorRisk" className="text-sm cursor-pointer">
              Enable continuous vendor risk monitoring
            </Label>
          </div>

          <Button className="bg-prism-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Agent Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Brand Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Customization
          </CardTitle>
          <CardDescription>Customize the platform appearance for your brand</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  defaultValue="#0066FF"
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  defaultValue="#0066FF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondaryColor"
                  type="color"
                  defaultValue="#00C9A7"
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  defaultValue="#00C9A7"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="logo">Company Logo</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Drag and drop your logo here, or click to browse</p>
              <Button variant="outline" size="sm">Choose File</Button>
            </div>
          </div>

          <Button className="bg-prism-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Branding
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>Manage admin users and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-prism-primary rounded-full flex items-center justify-center text-white font-semibold">
                JB
              </div>
              <div>
                <p className="font-medium">jbandu@gmail.com</p>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Super Admin</Badge>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </div>

          <Button variant="outline" className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Billing (Coming Soon) */}
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Badge className="mb-2">Coming Soon</Badge>
            <p className="text-sm text-gray-600">Subscription management will be available in the next release</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
