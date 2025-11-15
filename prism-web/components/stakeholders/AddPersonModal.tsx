"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAdded: (person: any) => void;
  companyId: string;
}

const PERSON_LEVELS = [
  { value: "Executive", label: "Executive (C-suite, VPs)" },
  { value: "Director", label: "Director" },
  { value: "Manager", label: "Manager" },
  { value: "IC", label: "Individual Contributor" },
];

const DEPARTMENTS = [
  "IT",
  "Finance",
  "Operations",
  "Procurement",
  "Sales",
  "Marketing",
  "HR",
  "Engineering",
  "Product",
  "Legal",
  "Security",
  "Other",
];

const DECISION_AUTHORITY = [
  { value: "Final", label: "Final (Can make final decisions)" },
  { value: "Approval", label: "Approval (Must approve decisions)" },
  { value: "Influence", label: "Influence (Can influence decisions)" },
  { value: "None", label: "None (Informed only)" },
];

export function AddPersonModal({
  isOpen,
  onClose,
  onPersonAdded,
  companyId,
}: AddPersonModalProps) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("Manager");
  const [decisionAuthority, setDecisionAuthority] = useState("Influence");
  const [budgetAuthority, setBudgetAuthority] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setTitle("");
    setDepartment("");
    setLevel("Manager");
    setDecisionAuthority("Influence");
    setBudgetAuthority("");
    setNotes("");
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      alert("Full name is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        companyId,
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        title: title || null,
        department: department || null,
        level,
        decision_authority: decisionAuthority,
        budget_authority: budgetAuthority ? parseFloat(budgetAuthority) : null,
        notes: notes || null,
      };

      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to add person");
      }

      onPersonAdded(result.data);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding person:", error);
      alert(error instanceof Error ? error.message : "Failed to add person");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Add a new person to the organizational directory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">
              Basic Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="VP of Infrastructure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Organizational Level */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">
              Organizational Level
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSON_LEVELS.map((lvl) => (
                      <SelectItem key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisionAuthority">Decision Authority</Label>
                <Select
                  value={decisionAuthority}
                  onValueChange={setDecisionAuthority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DECISION_AUTHORITY.map((auth) => (
                      <SelectItem key={auth.value} value={auth.value}>
                        {auth.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="budgetAuthority">
                  Budget Authority (USD)
                </Label>
                <Input
                  id="budgetAuthority"
                  type="number"
                  placeholder="50000"
                  value={budgetAuthority}
                  onChange={(e) => setBudgetAuthority(e.target.value)}
                />
                <div className="text-xs text-gray-500">
                  Maximum amount this person can approve
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this person..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !fullName.trim()}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Person
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
