"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Play,
  Mail,
  ExternalLink,
  FileText,
  ArrowUpDown,
  CheckCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  status: "active" | "prospect" | "churned";
  software: number;
  annualSpend: number;
  savings: number;
  lastActive: string;
  industry: string;
  employees: number;
}

// Mock data
const mockClients: Client[] = [
  {
    id: "biorad",
    company: "BioRad Laboratories",
    contact: "Muhammad Hanif",
    email: "mhanif@bio-rad.com",
    status: "active",
    software: 67,
    annualSpend: 12400000,
    savings: 2100000,
    lastActive: "2 hrs ago",
    industry: "Life Sciences",
    employees: 4200
  },
  {
    id: "coorstek",
    company: "CoorsTek",
    contact: "Ryan Reed",
    email: "ryan.reed@coorstek.com",
    status: "prospect",
    software: 0,
    annualSpend: 0,
    savings: 0,
    lastActive: "Never",
    industry: "Manufacturing",
    employees: 6000
  }
];

const formatCurrency = (value: number) => {
  if (value === 0) return "$0";
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export default function CompaniesPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "prospect" | "churned">("all");
  const [sortBy, setSortBy] = useState<"name" | "spend" | "savings" | "lastActive">("name");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [addClientStep, setAddClientStep] = useState(1);

  // Form state for adding new client
  const [newClient, setNewClient] = useState({
    companyName: "",
    industry: "",
    location: "",
    employeeCount: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactTitle: "",
    contractStatus: "prospect" as const,
    startDate: "",
    contractValue: "",
    billingFrequency: "monthly",
    notes: ""
  });

  const filteredClients = clients
    .filter(client => {
      const matchesSearch = client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.contact.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.company.localeCompare(b.company);
        case "spend":
          return b.annualSpend - a.annualSpend;
        case "savings":
          return b.savings - a.savings;
        default:
          return 0;
      }
    });

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const renderAddClientForm = () => {
    switch (addClientStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={newClient.companyName}
                onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                placeholder="e.g., BioRad Laboratories"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Input
                id="industry"
                value={newClient.industry}
                onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                placeholder="e.g., Life Sciences, Technology, Manufacturing"
              />
            </div>
            <div>
              <Label htmlFor="location">Headquarters Location</Label>
              <Input
                id="location"
                value={newClient.location}
                onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor="employeeCount">Employee Count *</Label>
              <Input
                id="employeeCount"
                type="number"
                value={newClient.employeeCount}
                onChange={(e) => setNewClient({ ...newClient, employeeCount: e.target.value })}
                placeholder="e.g., 4200"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactName">Full Name *</Label>
              <Input
                id="contactName"
                value={newClient.contactName}
                onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                placeholder="e.g., Muhammad Hanif"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={newClient.contactEmail}
                onChange={(e) => setNewClient({ ...newClient, contactEmail: e.target.value })}
                placeholder="e.g., mhanif@bio-rad.com"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={newClient.contactPhone}
                onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contactTitle">Title</Label>
              <Input
                id="contactTitle"
                value={newClient.contactTitle}
                onChange={(e) => setNewClient({ ...newClient, contactTitle: e.target.value })}
                placeholder="e.g., IT Director"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contractStatus">Status *</Label>
              <select
                id="contractStatus"
                className="w-full border rounded-md p-2"
                value={newClient.contractStatus}
                onChange={(e) => setNewClient({ ...newClient, contractStatus: e.target.value as "prospect" | "active" })}
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newClient.startDate}
                onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contractValue">Contract Value (Annual)</Label>
              <Input
                id="contractValue"
                type="number"
                value={newClient.contractValue}
                onChange={(e) => setNewClient({ ...newClient, contractValue: e.target.value })}
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full border rounded-md p-2"
                rows={3}
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-lg">Review Your Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Company</p>
                  <p className="font-medium">{newClient.companyName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Industry</p>
                  <p className="font-medium">{newClient.industry}</p>
                </div>
                <div>
                  <p className="text-gray-600">Employees</p>
                  <p className="font-medium">{newClient.employeeCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Primary Contact</p>
                  <p className="font-medium">{newClient.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{newClient.contactEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge className={newClient.contractStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {newClient.contractStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-900">Login credentials will be created and sent to {newClient.contactEmail}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-prism-dark">Clients</h1>
          <p className="text-gray-600 mt-2">Manage all client accounts and portfolios</p>
        </div>
        <Button
          onClick={() => setShowAddClient(true)}
          className="bg-prism-primary hover:bg-prism-primary-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "prospect" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("prospect")}
              >
                Prospect
              </Button>
              <Button
                variant={statusFilter === "churned" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("churned")}
              >
                Churned
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients ({filteredClients.length})</CardTitle>
          <CardDescription>Click any row to view client details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Software</TableHead>
                <TableHead>Annual Spend</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleClientClick(client)}
                >
                  <TableCell className="font-medium">{client.company}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{client.contact}</div>
                      <div className="text-gray-500">{client.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : client.status === "prospect"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {client.status === "active" ? "🟢" : client.status === "prospect" ? "🟡" : "🔴"} {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.software}</TableCell>
                  <TableCell>{formatCurrency(client.annualSpend)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {formatCurrency(client.savings)}
                  </TableCell>
                  <TableCell>{client.lastActive}</TableCell>
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/${client.id}/dashboard`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      <Dialog open={showClientDetail} onOpenChange={setShowClientDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedClient?.company}</DialogTitle>
            <DialogDescription>Client details and quick actions</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Primary Contact</p>
                  <p className="font-medium">{selectedClient.contact}</p>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      selectedClient.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium">{selectedClient.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employees</p>
                  <p className="font-medium">{selectedClient.employees.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Portfolio Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Software</p>
                    <p className="text-2xl font-bold">{selectedClient.software}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Annual Spend</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedClient.annualSpend)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Savings</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.savings)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/${selectedClient.id}/dashboard`}>
                  <Button>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Modal */}
      <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Step {addClientStep} of 4</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded ${
                  step <= addClientStep ? "bg-prism-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-1">
              {addClientStep === 1 && "Company Information"}
              {addClientStep === 2 && "Primary Contact"}
              {addClientStep === 3 && "Contract Details"}
              {addClientStep === 4 && "Review & Create"}
            </h3>
            <p className="text-sm text-gray-600">
              {addClientStep === 1 && "Enter basic company details"}
              {addClientStep === 2 && "Add primary contact information"}
              {addClientStep === 3 && "Set up contract and billing"}
              {addClientStep === 4 && "Review and finalize"}
            </p>
          </div>

          {renderAddClientForm()}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setAddClientStep(Math.max(1, addClientStep - 1))}
              disabled={addClientStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (addClientStep === 4) {
                  // Handle client creation
                  setShowAddClient(false);
                  setAddClientStep(1);
                } else {
                  setAddClientStep(addClientStep + 1);
                }
              }}
              className="bg-prism-primary"
            >
              {addClientStep === 4 ? "Create Client" : "Next"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
