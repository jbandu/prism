"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Users, Building2, Globe, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Office {
  id: string;
  office_name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  employee_count: number;
  is_headquarters: boolean;
  timezone: string | null;
}

interface OfficeListSidebarProps {
  offices: Office[];
  selectedOffice?: Office | null;
  onSelect: (office: Office) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficeListSidebar({
  offices,
  selectedOffice,
  onSelect,
  isOpen,
  onClose,
}: OfficeListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");

  // Get unique regions for filtering
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    offices.forEach((office) => {
      if (office.country) {
        uniqueRegions.add(office.country);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [offices]);

  // Filter offices based on search and region
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        office.office_name.toLowerCase().includes(searchLower) ||
        office.city?.toLowerCase().includes(searchLower) ||
        office.country?.toLowerCase().includes(searchLower);

      // Region filter
      const matchesRegion =
        filterRegion === "all" || office.country === filterRegion;

      return matchesSearch && matchesRegion;
    });
  }, [offices, searchQuery, filterRegion]);

  // Statistics
  const totalEmployees = offices.reduce((sum, o) => sum + o.employee_count, 0);
  const headquarters = offices.find((o) => o.is_headquarters);

  return (
    <div
      className={cn(
        "absolute top-4 left-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 z-10",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-[360px] opacity-0"
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-prism-primary to-prism-primary-600 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-bold">Office Locations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur rounded-lg p-2">
            <div className="text-xs text-blue-100 mb-1">Total Locations</div>
            <div className="text-2xl font-bold">{offices.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-2">
            <div className="text-xs text-blue-100 mb-1">Total Employees</div>
            <div className="text-2xl font-bold">
              {totalEmployees.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search offices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2"
          />
        </div>

        {/* Region Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRegion("all")}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              filterRegion === "all"
                ? "bg-prism-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All Regions
          </button>
          {regions.slice(0, 4).map((region) => (
            <button
              key={region}
              onClick={() => setFilterRegion(region)}
              className={cn(
                "px-3 py-1 text-xs rounded-full transition-colors",
                filterRegion === region
                  ? "bg-prism-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Office List */}
      <div className="overflow-y-auto max-h-[500px]">
        {filteredOffices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No offices found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOffices.map((office) => (
              <button
                key={office.id}
                onClick={() => onSelect(office)}
                className={cn(
                  "w-full p-4 text-left transition-colors hover:bg-blue-50",
                  selectedOffice?.id === office.id && "bg-blue-50 border-l-4 border-prism-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {office.office_name}
                    </h3>
                    {office.is_headquarters && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full mb-1">
                        <Building2 className="w-3 h-3 text-yellow-700" />
                        <span className="text-xs font-medium text-yellow-700">
                          HQ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {office.city && office.country
                      ? `${office.city}, ${office.country}`
                      : office.city || office.country || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Users className="w-3.5 h-3.5" />
                  <span>{office.employee_count.toLocaleString()} employees</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {filteredOffices.length} of {offices.length} locations shown
        </div>
      </div>
    </div>
  );
}
