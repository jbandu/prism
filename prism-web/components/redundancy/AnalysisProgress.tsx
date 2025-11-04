'use client';

import { Clock, X, CheckCircle, AlertCircle, Loader2, Activity, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect, useRef } from 'react';

export interface ActivityLogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AnalysisProgress {
  companyId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  progress: number;
  totalSoftware: number;
  processedSoftware: number;
  overlapsFound: number;
  estimatedTimeRemaining: number;
  startTime: number;
  message: string;
  cancellationRequested: boolean;
  activityLog: ActivityLogEntry[];
}

interface AnalysisProgressProps {
  progress: AnalysisProgress;
  onCancel?: () => void;
}

export function AnalysisProgressDisplay({ progress, onCancel }: AnalysisProgressProps) {
  const [showActivityLog, setShowActivityLog] = useState(true);
  const activityLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new activity is added
  useEffect(() => {
    if (activityLogRef.current && showActivityLog) {
      activityLogRef.current.scrollTop = activityLogRef.current.scrollHeight;
    }
  }, [progress.activityLog, showActivityLog]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'running':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'cancelled':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'running':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-yellow-400" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className={`text-lg font-bold ${getStatusColor()}`}>
                {progress.status === 'running' && 'Analysis in Progress'}
                {progress.status === 'completed' && 'Analysis Complete!'}
                {progress.status === 'failed' && 'Analysis Failed'}
                {progress.status === 'cancelled' && 'Analysis Cancelled'}
                {progress.status === 'queued' && 'Analysis Queued'}
              </h3>
              <p className="text-sm text-gray-400">{progress.message}</p>
            </div>
          </div>

          {progress.status === 'running' && !progress.cancellationRequested && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Analysis
            </button>
          )}

          {progress.cancellationRequested && (
            <div className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm">
              Cancelling...
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">{progress.currentStep}</span>
            <span className="text-sm font-bold text-white">{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-3" />
        </div>

        {/* Stats Grid */}
        {progress.status === 'running' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-500 mb-1">Software Products</p>
              <p className="text-lg font-bold text-white">
                {progress.processedSoftware} / {progress.totalSoftware}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Overlaps Found</p>
              <p className="text-lg font-bold text-white">{progress.overlapsFound}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
              <p className="text-lg font-bold text-white flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(progress.estimatedTimeRemaining)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Elapsed Time</p>
              <p className="text-lg font-bold text-white">
                {formatTime((Date.now() - progress.startTime) / 1000)}
              </p>
            </div>
          </div>
        )}

        {/* Completion Summary */}
        {progress.status === 'completed' && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Software</p>
                <p className="text-lg font-bold text-white">{progress.totalSoftware}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Overlaps Detected</p>
                <p className="text-lg font-bold text-green-400">{progress.overlapsFound}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Time</p>
                <p className="text-lg font-bold text-white">
                  {formatTime((Date.now() - progress.startTime) / 1000)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log */}
        {progress.activityLog && progress.activityLog.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors mb-3"
            >
              <Activity className="w-4 h-4" />
              Activity Log
              <span className="text-xs text-gray-500">
                ({progress.activityLog.length} events)
              </span>
              <X
                className={`w-4 h-4 ml-auto transition-transform ${showActivityLog ? 'rotate-0' : 'rotate-45'}`}
              />
            </button>

            {showActivityLog && (
              <div
                ref={activityLogRef}
                className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2 border border-gray-700/50"
              >
                {progress.activityLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-xs"
                  >
                    <span className="text-gray-500 font-mono flex-shrink-0 w-20">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    {getActivityIcon(entry.type)}
                    <span className={`flex-1 ${getActivityColor(entry.type)}`}>
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
