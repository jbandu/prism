"use client";

import { useEffect, useState } from "react";
import { OfficeMap } from "@/components/maps/OfficeMap";
import { Globe, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Office {
  id: string;
  company_id: string;
  office_name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  employee_count: number;
  is_headquarters: boolean;
  timezone: string | null;
  created_at: Date;
  updated_at: Date;
}

export default function LocationsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffices();
  }, [params.companyId]);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/offices?companyId=${params.companyId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch office locations");
      }

      setOffices(result.data || []);
    } catch (err) {
      console.error("Error fetching offices:", err);
      setError(err instanceof Error ? err.message : "Failed to load offices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prism-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading office locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-red-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Locations
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOffices}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (offices.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-prism-primary to-prism-primary-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Global Presence
              </h1>
              <p className="text-gray-600">
                View and manage your office locations worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center h-[calc(100vh-250px)] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-center p-8 max-w-md">
            <MapPin className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Office Locations Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first office location to see it on the interactive map
              with live weather data.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Office Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-prism-primary to-prism-primary-600 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Presence</h1>
            <p className="text-gray-600">
              {offices.length} office location{offices.length !== 1 ? "s" : ""}{" "}
              •{" "}
              {offices
                .reduce((sum, o) => sum + o.employee_count, 0)
                .toLocaleString()}{" "}
              employees worldwide
            </p>
          </div>
        </div>

        <Button className="gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      {/* Map */}
      <OfficeMap offices={offices} companyId={params.companyId} />

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {offices.length}
              </div>
              <div className="text-sm text-blue-700">
                Office Locations
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {new Set(offices.map((o) => o.country)).size}
              </div>
              <div className="text-sm text-green-700">
                Countries
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {offices
                  .reduce((sum, o) => sum + o.employee_count, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-purple-700">
                Total Employees
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
