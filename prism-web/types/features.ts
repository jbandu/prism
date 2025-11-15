// types/features.ts

export interface FeatureRequest {
  id: string;
  requested_by_user_id: string;
  company_id: string;
  created_at: string;
  initial_request: string;
  final_requirements: string | null;
  requirements_finalized_at: string | null;
  chat_history: ChatMessage[];
  status: FeatureStatus;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  github_issue_url: string | null;
  github_pr_url: string | null;
  vercel_preview_url: string | null;
  build_started_at: string | null;
  build_completed_at: string | null;
  build_logs: string | null;
  build_error: string | null;
  upvotes: number;
  downvotes: number;
  priority: FeaturePriority;
  tags: string[];
  estimated_complexity: FeatureComplexity | null;
  updated_at: string;
  
  // Joined fields
  requested_by_name?: string;
  requested_by_email?: string;
  company_name?: string;
  reviewed_by_name?: string;
}

export type FeatureStatus = 
  | 'refining'       // User is chatting with AI to refine
  | 'submitted'      // Finalized and waiting for admin approval
  | 'approved'       // Admin approved, ready to build
  | 'rejected'       // Admin rejected
  | 'building'       // Autonomous build in progress
  | 'testing'        // Build complete, tests running
  | 'deployed'       // Successfully deployed
  | 'failed';        // Build or deployment failed

export type FeaturePriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'critical' 
  | 'auto'; // Auto-approved due to votes

export type FeatureComplexity = 
  | 'trivial'        // 1 file, simple change
  | 'simple'         // 1-3 files, straightforward
  | 'moderate'       // 3-8 files, some complexity
  | 'complex'        // 8-15 files, significant work
  | 'very_complex';  // 15+ files, architectural changes

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SynthesizedRequirements {
  summary: string;
  requirements: string;
  acceptanceCriteria: string[];
  filesLikelyModified: string[];
  estimatedComplexity: FeatureComplexity;
  tags: string[];
}

export interface BuildAttempt {
  id: string;
  feature_request_id: string;
  attempt_number: number;
  started_at: string;
  completed_at: string | null;
  status: 'success' | 'failed' | 'stuck';
  files_modified: string[];
  git_commit_sha: string | null;
  preview_url: string | null;
  stdout: string | null;
  stderr: string | null;
  error_message: string | null;
  stuck_reason: string | null;
  intervention_required: boolean;
  intervention_email_sent: boolean;
}

// API Request/Response types

export interface CreateFeatureRequestBody {
  initialRequest: string;
}

export interface CreateFeatureRequestResponse {
  featureId: string;
}

export interface RefineFeatureRequestBody {
  featureId: string;
  message: string;
}

export interface RefineFeatureRequestResponse {
  message: string;
  isReadyToFinalize?: boolean;
}

export interface FinalizeFeatureRequestBody {
  featureId: string;
  finalMessage: string;
}

export interface FinalizeFeatureRequestResponse {
  success: boolean;
  synthesizedRequirements: SynthesizedRequirements;
}

export interface ApproveFeatureBody {
  requestId: string;
}

export interface RejectFeatureBody {
  requestId: string;
  reason?: string;
}

export interface BuildFeatureBody {
  requestId: string;
}

export interface BuildFeatureResponse {
  success: boolean;
  buildId?: string;
  previewUrl?: string;
  error?: string;
}
