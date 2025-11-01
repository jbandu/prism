import { Button } from "@/components/ui/button";
import {
  Package,
  GitCompare,
  FileText,
  Activity,
  Upload,
  Plus,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || <Package className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-prism-primary hover:bg-prism-primary-600">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function NoSoftwareState({ onImport, onAdd }: { onImport?: () => void; onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-prism-primary" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No software yet</h3>
      <p className="text-gray-600 max-w-md mb-8">
        Start building your software portfolio by importing from CSV or adding software manually
      </p>
      <div className="flex gap-3">
        <Button onClick={onImport} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import from CSV
        </Button>
        <Button onClick={onAdd} className="bg-prism-primary hover:bg-prism-primary-600 gap-2">
          <Plus className="w-4 h-4" />
          Add Software
        </Button>
      </div>
    </div>
  );
}

export function NoAlternativesState({ onAnalyze }: { onAnalyze?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <GitCompare className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No alternatives found yet</h3>
      <p className="text-gray-600 max-w-md mb-8">
        Run AI analysis to discover better, cheaper alternatives to your current software
      </p>
      <Button onClick={onAnalyze} className="bg-green-600 hover:bg-green-700 gap-2">
        <Sparkles className="w-4 h-4" />
        Run AI Analysis
      </Button>
    </div>
  );
}

export function NoReportsState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No reports yet</h3>
      <p className="text-gray-600 max-w-md mb-8">
        Generate comprehensive reports with insights, savings opportunities, and recommendations
      </p>
      <Button onClick={onGenerate} className="bg-purple-600 hover:bg-purple-700 gap-2">
        <FileText className="w-4 h-4" />
        Generate Report
      </Button>
    </div>
  );
}

export function NoActivityState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Activity className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
      <p className="text-sm text-gray-600 max-w-sm">
        Your activity timeline will appear here as you use the platform
      </p>
    </div>
  );
}
