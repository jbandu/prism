'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ContractUploaderProps {
  companyId: string;
  softwareList?: Array<{ id: string; software_name: string; vendor_name: string }>;
  onUploadComplete?: (contractId: string) => void;
}

export function ContractUploader({
  companyId,
  softwareList = [],
  onUploadComplete
}: ContractUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [contractType, setContractType] = useState('subscription');
  const [selectedSoftwareId, setSelectedSoftwareId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      toast.error('File size must be under 25MB');
      return;
    }

    setSelectedFile(file);

    // Auto-fill contract name from filename
    if (!contractName) {
      const fileName = file.name.replace('.pdf', '');
      setContractName(fileName);
    }

    toast.success(`Selected: ${file.name}`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSoftwareSelect = (softwareId: string) => {
    setSelectedSoftwareId(softwareId);

    // Auto-fill vendor name
    const software = softwareList.find(s => s.id === softwareId);
    if (software && !vendorName) {
      setVendorName(software.vendor_name);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !contractName || !vendorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(10);

    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(selectedFile);
      setUploadProgress(30);

      setUploadStatus('analyzing');
      toast.info('🤖 AI is analyzing your contract...', {
        description: 'This may take 30-60 seconds'
      });

      // Upload and analyze
      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          softwareId: selectedSoftwareId || undefined,
          contractName,
          vendorName,
          contractType,
          fileData: base64Data,
          fileName: selectedFile.name
        })
      });

      setUploadProgress(90);

      const result = await response.json();

      if (result.success) {
        setUploadProgress(100);
        setUploadStatus('success');
        setAnalysisResult(result.data);

        toast.success('✨ Contract analyzed successfully!', {
          description: `Found ${result.data.risk_alerts_count} risk alerts`
        });

        if (onUploadComplete) {
          onUploadComplete(result.data.contract_id);
        }

        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
        }, 3000);

      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Failed to upload contract', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setContractName('');
    setVendorName('');
    setContractType('subscription');
    setSelectedSoftwareId('');
    setUploadProgress(0);
    setUploadStatus('idle');
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-prism-primary" />
          Upload Contract
        </CardTitle>
        <CardDescription>
          Upload a PDF contract for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        {uploadStatus === 'idle' && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-prism-primary bg-blue-50'
                : 'border-gray-300 hover:border-prism-primary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <FileText className="w-16 h-16 text-prism-primary mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your PDF here, or
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  PDF files only, max 25MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-16 h-16 text-prism-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'AI Analyzing Contract...'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {uploadStatus === 'uploading'
                    ? 'Uploading your contract file'
                    : 'Extracting terms, identifying risks, and generating insights'}
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-prism-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {uploadStatus === 'success' && analysisResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Contract Analyzed Successfully!
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      {analysisResult.risk_alerts_count}
                    </p>
                    <p className="text-sm text-gray-600">Risk Alerts</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">
                      {analysisResult.reminders_count}
                    </p>
                    <p className="text-sm text-gray-600">Reminders</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">
                      {analysisResult.analysis.file_size_mb}MB
                    </p>
                    <p className="text-sm text-gray-600">File Size</p>
                  </div>
                </div>
                <Button
                  className="mt-6"
                  onClick={resetForm}
                >
                  Upload Another Contract
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadStatus === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  Something went wrong. Please try again.
                </p>
                <Button onClick={resetForm}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        {uploadStatus === 'idle' && selectedFile && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contractName">Contract Name *</Label>
              <Input
                id="contractName"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="e.g., Salesforce Enterprise Agreement 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name *</Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g., Salesforce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType">Contract Type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger id="contractType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="perpetual">Perpetual License</SelectItem>
                  <SelectItem value="enterprise">Enterprise Agreement</SelectItem>
                  <SelectItem value="professional-services">Professional Services</SelectItem>
                  <SelectItem value="saas">SaaS Agreement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {softwareList.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="software">Link to Software (Optional)</Label>
                <Select value={selectedSoftwareId} onValueChange={handleSoftwareSelect}>
                  <SelectTrigger id="software">
                    <SelectValue placeholder="Select software..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {softwareList.map((software) => (
                      <SelectItem key={software.id} value={software.id}>
                        {software.software_name} ({software.vendor_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleUpload}
              disabled={uploading || !contractName || !vendorName}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upload & Analyze with AI
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
