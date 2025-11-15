// lib/notifications.ts

import { Resend } from 'resend';
import { query } from './db';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;
function getResend() {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || '');
  }
  return resendInstance;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jbandu@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'PRISM <noreply@prism.ai>';

// Send email to admin
export async function sendAdminNotification(data: {
  type: 'new_feature_request' | 'build_failed' | 'build_success';
  featureId: string;
  requestedBy?: string;
  company?: string;
  summary?: string;
  complexity?: string;
  error?: string;
  logs?: string;
  previewUrl?: string;
}) {
  try {
    let subject = '';
    let html = '';

    switch (data.type) {
      case 'new_feature_request':
        subject = `🚀 New Feature Request: ${data.summary?.substring(0, 50)}`;
        html = `
          <h2>New Feature Request</h2>
          <p><strong>Requested by:</strong> ${data.requestedBy} (${data.company})</p>
          <p><strong>Summary:</strong> ${data.summary}</p>
          <p><strong>Complexity:</strong> ${data.complexity}</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/features/approve" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review & Approve
            </a>
          </p>
        `;
        break;

      case 'build_failed':
        subject = `🚨 Build Failed: Feature ${data.featureId}`;
        html = `
          <h2>Autonomous Build Failed</h2>
          <p><strong>Feature ID:</strong> ${data.featureId}</p>
          ${data.error ? `<p><strong>Error:</strong> ${data.error}</p>` : ''}
          ${data.logs ? `
            <details>
              <summary>Build Logs</summary>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto;">
${data.logs}
              </pre>
            </details>
          ` : ''}
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/features/builds/${data.featureId}" 
               style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Build Details
            </a>
          </p>
        `;
        break;

      case 'build_success':
        subject = `✅ Feature Deployed: ${data.summary?.substring(0, 50)}`;
        html = `
          <h2>Feature Successfully Deployed!</h2>
          <p><strong>Feature ID:</strong> ${data.featureId}</p>
          <p><strong>Summary:</strong> ${data.summary}</p>
          ${data.previewUrl ? `
            <p>
              <a href="${data.previewUrl}" 
                 style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Live Feature
              </a>
            </p>
          ` : ''}
        `;
        break;
    }

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    // Don't throw - notifications are not critical
  }
}

// Send email to user
export async function sendUserNotification(data: {
  userId: string;
  type: 'feature_approved' | 'feature_rejected' | 'feature_deployed';
  subject: string;
  message: string;
  featureId: string;
  previewUrl?: string;
}) {
  try {
    // Get user email
    const result = await query(`
      SELECT email, full_name FROM users WHERE id = $1
    `, [data.userId]);

    if (result.rowCount === 0) {
      console.warn('User not found for notification:', data.userId);
      return;
    }

    const user = result.rows[0];

    let html = `
      <h2>Hello ${user.full_name},</h2>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `;

    if (data.previewUrl) {
      html += `
        <p>
          <a href="${data.previewUrl}" 
             style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Feature
          </a>
        </p>
      `;
    }

    html += `
      <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
        — The PRISM Team
      </p>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: data.subject,
      html,
    });
  } catch (error) {
    console.error('Error sending user notification:', error);
    // Don't throw - notifications are not critical
  }
}

// Send intervention email when build gets stuck
export async function sendInterventionEmail(data: {
  featureId: string;
  error: string;
  logs?: string;
  stage: string;
}) {
  await sendAdminNotification({
    type: 'build_failed',
    featureId: data.featureId,
    error: `Build stuck at stage: ${data.stage}\n\n${data.error}`,
    logs: data.logs,
  });
}
