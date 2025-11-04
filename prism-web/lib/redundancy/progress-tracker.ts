/**
 * Progress Tracker for Redundancy Analysis
 * Tracks progress across multiple steps and provides real-time updates
 */

export interface AnalysisProgress {
  companyId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  progress: number; // 0-100
  totalSoftware: number;
  processedSoftware: number;
  overlapsFound: number;
  estimatedTimeRemaining: number; // seconds
  startTime: number;
  message: string;
  cancellationRequested: boolean;
  results?: any; // Store analysis results when complete
}

// In-memory store for progress tracking
// In production, use Redis or similar
const progressStore = new Map<string, AnalysisProgress>();

export class ProgressTracker {
  private companyId: string;
  private startTime: number;
  private stepStartTime: number;

  constructor(companyId: string, totalSoftware: number) {
    this.companyId = companyId;
    this.startTime = Date.now();
    this.stepStartTime = Date.now();

    // Initialize progress
    progressStore.set(companyId, {
      companyId,
      status: 'queued',
      currentStep: 'Initializing',
      progress: 0,
      totalSoftware,
      processedSoftware: 0,
      overlapsFound: 0,
      estimatedTimeRemaining: 0,
      startTime: this.startTime,
      message: 'Starting analysis...',
      cancellationRequested: false,
    });
  }

  updateProgress(
    currentStep: string,
    progress: number,
    message: string,
    additionalData?: Partial<AnalysisProgress>
  ) {
    const existing = progressStore.get(this.companyId);
    if (!existing) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const estimatedTotal = progress > 0 ? (elapsed / progress) * 100 : 0;
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);

    progressStore.set(this.companyId, {
      ...existing,
      currentStep,
      progress: Math.min(100, Math.max(0, progress)),
      message,
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
      status: 'running',
      ...additionalData,
    });

    this.stepStartTime = Date.now();
  }

  complete(overlapsFound: number, totalRedundancyCost: number, results?: any) {
    const existing = progressStore.get(this.companyId);
    if (!existing) return;

    progressStore.set(this.companyId, {
      ...existing,
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      overlapsFound,
      estimatedTimeRemaining: 0,
      message: `Analysis complete! Found ${overlapsFound} overlaps with $${totalRedundancyCost.toFixed(0)} in redundancy costs.`,
      results, // Store the full analysis results
    });

    // Clean up after 30 minutes (give time for user to view results)
    setTimeout(() => {
      progressStore.delete(this.companyId);
    }, 30 * 60 * 1000);
  }

  fail(error: string) {
    const existing = progressStore.get(this.companyId);
    if (!existing) return;

    progressStore.set(this.companyId, {
      ...existing,
      status: 'failed',
      message: `Analysis failed: ${error}`,
      estimatedTimeRemaining: 0,
    });

    // Clean up after 5 minutes
    setTimeout(() => {
      progressStore.delete(this.companyId);
    }, 5 * 60 * 1000);
  }

  cancel() {
    const existing = progressStore.get(this.companyId);
    if (!existing) return;

    progressStore.set(this.companyId, {
      ...existing,
      status: 'cancelled',
      message: 'Analysis cancelled by user',
      estimatedTimeRemaining: 0,
    });

    // Clean up after 1 minute
    setTimeout(() => {
      progressStore.delete(this.companyId);
    }, 60 * 1000);
  }

  isCancelled(): boolean {
    const progress = progressStore.get(this.companyId);
    return progress?.cancellationRequested || false;
  }

  static requestCancellation(companyId: string) {
    const existing = progressStore.get(companyId);
    if (existing) {
      progressStore.set(companyId, {
        ...existing,
        cancellationRequested: true,
        message: 'Cancellation requested...',
      });
    }
  }

  static getProgress(companyId: string): AnalysisProgress | null {
    return progressStore.get(companyId) || null;
  }

  static clearProgress(companyId: string) {
    progressStore.delete(companyId);
  }
}
