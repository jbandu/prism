"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AddPersonModal } from "./AddPersonModal";

interface StakeholderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  softwareId: string;
  companyId: string;
  existingStakeholder?: any;
  mode: "add" | "edit";
}

const ROLE_TYPES = [
  {
    category: "Executive",
    roles: [
      {
        value: "executive_sponsor",
        label: "Executive Sponsor",
        description: "C-level or VP who owns this strategically",
      },
    ],
  },
  {
    category: "Business",
    roles: [
      {
        value: "business_owner",
        label: "Business Owner",
        description: "Primary business stakeholder who defines requirements",
      },
      {
        value: "power_user",
        label: "Power User",
        description: "Heavy user who influences decisions",
      },
    ],
  },
  {
    category: "IT",
    roles: [
      {
        value: "it_owner",
        label: "IT Owner",
        description: "Technical owner responsible for implementation",
      },
      {
        value: "security_reviewer",
        label: "Security Reviewer",
        description: "Reviews security and compliance",
      },
    ],
  },
  {
    category: "Procurement",
    roles: [
      {
        value: "procurement_lead",
        label: "Procurement Lead",
        description: "Manages vendor relationship and contracts",
      },
    ],
  },
  {
    category: "Finance",
    roles: [
      {
        value: "finance_approver",
        label: "Finance Approver",
        description: "Approves budget and reviews costs",
      },
    ],
  },
];

const ROLE_LEVELS = [
  {
    value: "primary",
    label: "Primary (Key Decision Maker)",
    description: "Main person responsible for this role",
  },
  {
    value: "secondary",
    label: "Secondary (Backup)",
    description: "Backup or supporting person",
  },
  {
    value: "informed",
    label: "Informed (FYI Only)",
    description: "Kept informed but not a decision maker",
  },
];

export function StakeholderEditModal({
  isOpen,
  onClose,
  onSave,
  softwareId,
  companyId,
  existingStakeholder,
  mode,
}: StakeholderEditModalProps) {
  const [people, setPeople] = useState<any[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Form state
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleLevel, setRoleLevel] = useState<string>("primary");
  const [responsibilities, setResponsibilities] = useState<string>("");
  const [decisionWeight, setDecisionWeight] = useState<number>(0.5);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      if (mode === "edit" && existingStakeholder) {
        loadExistingStakeholder();
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, existingStakeholder]);

  const fetchPeople = async () => {
    try {
      setLoadingPeople(true);
      const response = await fetch(`/api/people?companyId=${companyId}`);
      const result = await response.json();

      if (result.success) {
        setPeople(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoadingPeople(false);
    }
  };

  const loadExistingStakeholder = () => {
    if (!existingStakeholder) return;

    setSelectedPersonId(existingStakeholder.person_id || "");
    setSelectedRole(existingStakeholder.role_type || "");
    setRoleLevel(existingStakeholder.role_level || "primary");
    setResponsibilities(
      existingStakeholder.responsibilities?.join(", ") || ""
    );
    setDecisionWeight(existingStakeholder.decision_weight || 0.5);
  };

  const resetForm = () => {
    setSelectedPersonId("");
    setSelectedRole("");
    setRoleLevel("primary");
    setResponsibilities("");
    setDecisionWeight(0.5);
    setSearchQuery("");
  };

  const handleSave = async () => {
    if (!selectedPersonId || !selectedRole) {
      alert("Please select a person and role");
      return;
    }

    setSaving(true);

    try {
      const responsibilitiesArray = responsibilities
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const payload = {
        software_asset_id: softwareId,
        person_id: selectedPersonId,
        role_type: selectedRole,
        role_level: roleLevel,
        responsibilities: responsibilitiesArray,
        decision_weight: decisionWeight,
      };

      let response;
      if (mode === "edit" && existingStakeholder) {
        response = await fetch(`/api/stakeholders/${existingStakeholder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/stakeholders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save stakeholder");
      }

      onSave();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving stakeholder:", error);
      alert(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const filteredPeople = people.filter((person) => {
    const query = searchQuery.toLowerCase();
    return (
      person.full_name.toLowerCase().includes(query) ||
      (person.title && person.title.toLowerCase().includes(query)) ||
      (person.department && person.department.toLowerCase().includes(query)) ||
      (person.email && person.email.toLowerCase().includes(query))
    );
  });

  const selectedPerson = people.find((p) => p.id === selectedPersonId);
  const selectedRoleInfo = ROLE_TYPES.flatMap((cat) => cat.roles).find(
    (r) => r.value === selectedRole
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Stakeholder" : "Add Stakeholder"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the stakeholder's role and responsibilities"
              : "Assign a person to a stakeholder role for this software"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Person Selection */}
          <div className="space-y-2">
            <Label htmlFor="person">Person *</Label>
            {loadingPeople ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 p-3 border rounded">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading people...
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, title, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* People List */}
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {filteredPeople.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No people found
                    </div>
                  ) : (
                    filteredPeople.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                          selectedPersonId === person.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {person.full_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {person.title}
                          {person.department && ` • ${person.department}`}
                        </div>
                        {person.email && (
                          <div className="text-xs text-gray-500 mt-1">
                            {person.email}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Add New Person Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPerson(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Person
                </Button>
              </>
            )}

            {/* Selected Person Preview */}
            {selectedPerson && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium text-blue-900">
                  Selected: {selectedPerson.full_name}
                </div>
                <div className="text-xs text-blue-700">
                  {selectedPerson.title}
                  {selectedPerson.department &&
                    ` • ${selectedPerson.department}`}
                </div>
              </div>
            )}
          </div>

          {/* Role Type */}
          <div className="space-y-2">
            <Label htmlFor="role">Role Type *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TYPES.map((category) => (
                  <SelectGroup key={category.category}>
                    <SelectLabel>{category.category}</SelectLabel>
                    {category.roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {selectedRoleInfo && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {selectedRoleInfo.description}
              </div>
            )}
          </div>

          {/* Role Level */}
          <div className="space-y-2">
            <Label htmlFor="roleLevel">Role Level</Label>
            <Select value={roleLevel} onValueChange={setRoleLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-gray-500">
                        {level.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsibilities */}
          <div className="space-y-2">
            <Label htmlFor="responsibilities">
              Responsibilities (comma-separated)
            </Label>
            <Textarea
              id="responsibilities"
              placeholder="e.g., Budget approval, Vendor negotiation, User training"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
            />
            <div className="text-xs text-gray-500">
              Enter multiple responsibilities separated by commas
            </div>
            {responsibilities && (
              <div className="flex flex-wrap gap-1 mt-2">
                {responsibilities
                  .split(",")
                  .map((r) => r.trim())
                  .filter((r) => r.length > 0)
                  .map((resp, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {resp}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Decision Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="decisionWeight">Decision Weight (Influence)</Label>
              <span className="text-sm font-medium text-blue-600">
                {(decisionWeight * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              id="decisionWeight"
              min="0"
              max="1"
              step="0.05"
              value={decisionWeight}
              onChange={(e) => setDecisionWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0% (Informed only)</span>
              <span>50% (Moderate influence)</span>
              <span>100% (Final decision)</span>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {decisionWeight >= 0.9
                ? "Has final decision authority"
                : decisionWeight >= 0.7
                ? "Strong influence on decisions"
                : decisionWeight >= 0.5
                ? "Moderate influence, consulted regularly"
                : decisionWeight >= 0.3
                ? "Some influence, provides input"
                : "Kept informed, minimal influence"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedPersonId || !selectedRole}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {mode === "edit" ? "Update Stakeholder" : "Add Stakeholder"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onPersonAdded={(newPerson) => {
          fetchPeople(); // Refresh people list
          setSelectedPersonId(newPerson.id); // Auto-select the new person
          setShowAddPerson(false);
        }}
        companyId={companyId}
      />
    </Dialog>
  );
}
