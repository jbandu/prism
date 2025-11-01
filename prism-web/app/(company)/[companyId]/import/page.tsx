"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle,
  Package,
  ArrowLeft,
  TrendingDown,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import type { Software } from "@/types";
import Link from "next/link";

interface RetirementData {
  software: Software;
  reason?: string;
  prismAssisted: boolean;
  savings: number;
}

export default function ImportPage({
  params,
}: {
  params: { companyId: string };
}) {
  const router = useRouter();
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [retireDialog, setRetireDialog] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [prismAssisted, setPrismAssisted] = useState(false);
  const [actualCompanyId, setActualCompanyId] = useState<string>("");

  useEffect(() => {
    fetchSoftware();
  }, [params.companyId]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      const companyResponse = await fetch(`/api/companies/${params.companyId}`);
      const companyResult = await companyResponse.json();

      if (companyResult.success && companyResult.data) {
        const companyId = companyResult.data.id;
        setActualCompanyId(companyId);

        const response = await fetch(`/api/software?companyId=${companyId}`);
        const result = await response.json();

        if (result.success) {
          setSoftware(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching software:", error);
      toast.error("Failed to load software");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Generate CSV template
  const generateCSVTemplate = (includeData: boolean = false) => {
    const headers = [
      "software_name",
      "vendor_name",
      "category",
      "total_annual_cost",
      "total_licenses",
      "active_users",
      "license_type",
      "renewal_date",
      "contract_start_date",
      "contract_end_date",
    ];

    let csvContent = headers.join(",") + "\n";

    if (includeData && software.length > 0) {
      // Export current software data
      software.forEach((item) => {
        const row = [
          `"${item.software_name}"`,
          `"${item.vendor_name}"`,
          `"${item.category}"`,
          parseFloat(item.total_annual_cost as any) || 0,
          item.total_licenses,
          item.active_users,
          `"${item.license_type}"`,
          formatDate(item.renewal_date),
          item.contract_start_date ? formatDate(item.contract_start_date) : "",
          item.contract_end_date ? formatDate(item.contract_end_date) : "",
        ];
        csvContent += row.join(",") + "\n";
      });
    } else {
      // Blank template with example row
      const exampleRow = [
        '"Salesforce"',
        '"Salesforce Inc"',
        '"CRM"',
        '120000',
        '100',
        '85',
        '"per_user"',
        '12/31/2025',
        '01/01/2024',
        '12/31/2025',
      ];
      csvContent += exampleRow.join(",") + "\n";
    }

    return csvContent;
  };

  // Download CSV
  const handleDownloadCSV = (includeData: boolean) => {
    const csvContent = generateCSVTemplate(includeData);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = includeData
      ? `${params.companyId}-software-export-${new Date().toISOString().split("T")[0]}.csv`
      : `software-import-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(
      includeData ? "Current software exported!" : "Template downloaded!"
    );
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error("CSV file is empty");
        setUploading(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const dataLines = lines.slice(1);

      const importedSoftware = dataLines.map((line) => {
        // Parse CSV line (handle quoted values)
        const values: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index]?.replace(/"/g, "") || "";
        });

        return {
          software_name: rowData.software_name,
          vendor_name: rowData.vendor_name,
          category: rowData.category,
          total_annual_cost: parseFloat(rowData.total_annual_cost) || 0,
          total_licenses: parseInt(rowData.total_licenses) || 0,
          active_users: parseInt(rowData.active_users) || 0,
          license_type: rowData.license_type,
          renewal_date: rowData.renewal_date,
          contract_start_date: rowData.contract_start_date || null,
          contract_end_date: rowData.contract_end_date || null,
        };
      });

      // Send to API
      const response = await fetch("/api/software/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: actualCompanyId,
          software: importedSoftware,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully imported ${result.data.imported} software items!`);
        fetchSoftware(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to import software");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to process CSV file");
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Handle software retirement
  const handleRetire = (item: Software) => {
    setSelectedSoftware(item);
    setPrismAssisted(false);
    setRetireDialog(true);
  };

  const confirmRetirement = async () => {
    if (!selectedSoftware) return;

    try {
      const annualCost = parseFloat(selectedSoftware.total_annual_cost as any) || 0;

      const response = await fetch(`/api/software/${selectedSoftware.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prismAssisted,
          savings: annualCost,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          prismAssisted
            ? `${selectedSoftware.software_name} retired! PRISM helped save ${formatCurrency(annualCost)}/year 🎉`
            : `${selectedSoftware.software_name} retired successfully`
        );
        fetchSoftware();
        setRetireDialog(false);
        setSelectedSoftware(null);
      } else {
        toast.error(result.error || "Failed to retire software");
      }
    } catch (error) {
      console.error("Error retiring software:", error);
      toast.error("Failed to retire software");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Upload className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${params.companyId}/dashboard`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-prism-dark">Import Software</h1>
            <p className="text-gray-600 mt-2">
              Import software via CSV or manage your current inventory
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Software</p>
                <p className="text-2xl font-bold text-prism-dark">{software.length}</p>
              </div>
              <Package className="w-8 h-8 text-prism-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Annual Spend</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    software.reduce(
                      (sum, s) => sum + (parseFloat(s.total_annual_cost as any) || 0),
                      0
                    )
                  )}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready to Import</p>
                <p className="text-2xl font-bold text-green-600">CSV</p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
          <CardDescription>
            Download a template, fill it with your software data, and upload it back
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Download Templates */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Download Template</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {software.length > 0
                    ? "Download your current software as CSV or get a blank template"
                    : "Download a blank CSV template to get started"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {software.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadCSV(true)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Current Software
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleDownloadCSV(false)}
                  className="w-full"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Blank Template
                </Button>
              </div>
            </div>

            {/* Upload CSV */}
            <div className="border-2 border-dashed border-prism-primary rounded-lg p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-prism-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-prism-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Upload CSV</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your filled CSV file to import software
                </p>
              </div>
              <div>
                <Label
                  htmlFor="csv-upload"
                  className="cursor-pointer"
                >
                  <div className="w-full">
                    <Button
                      type="button"
                      disabled={uploading}
                      className="w-full bg-prism-primary hover:bg-prism-primary/90"
                      onClick={() => document.getElementById("csv-upload")?.click()}
                    >
                      {uploading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Select CSV File
                        </>
                      )}
                    </Button>
                  </div>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-2">
                  Supports CSV files with standard format
                </p>
              </div>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              CSV Format Requirements
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Required fields:</strong> software_name, vendor_name, category,
                total_annual_cost, total_licenses, active_users, license_type, renewal_date
              </p>
              <p>
                <strong>Optional fields:</strong> contract_start_date, contract_end_date
              </p>
              <p>
                <strong>Date format:</strong> MM/DD/YYYY (e.g., 12/31/2025)
              </p>
              <p>
                <strong>License types:</strong> per_user, per_device, site_license,
                consumption_based
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Software Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Current Software Inventory ({software.length})</CardTitle>
          <CardDescription>
            Manage your software assets - retire software you no longer use
          </CardDescription>
        </CardHeader>
        <CardContent>
          {software.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No software in inventory</p>
              <p className="text-sm text-gray-400">
                Upload a CSV file to import your software portfolio
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Annual Cost</TableHead>
                    <TableHead>Licenses</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {software.map((item) => {
                    const annualCost = parseFloat(item.total_annual_cost as any) || 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.software_name}
                            </p>
                            <p className="text-sm text-gray-500">{item.vendor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(annualCost)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{item.active_users}</span>
                            <span className="text-gray-500"> / {item.total_licenses}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(item.renewal_date)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetire(item)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Retire
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retirement Dialog */}
      <Dialog open={retireDialog} onOpenChange={setRetireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Software</DialogTitle>
            <DialogDescription>
              Are you sure you want to retire this software from your portfolio?
            </DialogDescription>
          </DialogHeader>

          {selectedSoftware && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-1">
                  {selectedSoftware.software_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedSoftware.vendor_name}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Annual Cost:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      parseFloat(selectedSoftware.total_annual_cost as any) || 0
                    )}
                  </span>
                </p>
              </div>

              <div className="border border-prism-primary/30 rounded-lg p-4 bg-prism-primary/5">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="prism-credit"
                    checked={prismAssisted}
                    onChange={(e) => setPrismAssisted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-prism-primary border-gray-300 rounded focus:ring-prism-primary"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="prism-credit"
                      className="font-semibold text-gray-900 flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-prism-primary" />
                      PRISM helped identify this retirement
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this if PRISM&apos;s analysis or recommendations helped you
                      decide to retire this software. We&apos;ll track this as a cost
                      savings achievement.
                    </p>
                  </div>
                </div>
              </div>

              {prismAssisted && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-1">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-semibold">Cost Savings Identified!</p>
                  </div>
                  <p className="text-sm text-green-700">
                    You&apos;ll save{" "}
                    <strong>
                      {formatCurrency(
                        parseFloat(selectedSoftware.total_annual_cost as any) || 0
                      )}
                      /year
                    </strong>{" "}
                    by retiring this software. This will be credited to your PRISM
                    savings dashboard.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRetireDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRetirement}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Retire Software
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
