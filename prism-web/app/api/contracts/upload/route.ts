import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import {
  parsePDFContract,
  analyzeContract,
  generateContractReminders,
  type ContractAnalysisResult
} from '@/lib/contracts/ai-contract-analyzer';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large PDFs

const UploadSchema = z.object({
  companyId: z.string().uuid(),
  softwareId: z.string().uuid().optional(),
  contractName: z.string().min(1),
  vendorName: z.string().min(1),
  contractType: z.string().optional().default('subscription'),
  // Base64 encoded PDF file
  fileData: z.string(),
  fileName: z.string(),
});

/**
 * POST - Upload and analyze contract
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = UploadSchema.parse(body);

    console.log(`Starting contract upload for ${data.contractName}`);

    // Decode base64 file data
    const base64Data = data.fileData.includes('base64,')
      ? data.fileData.split('base64,')[1]
      : data.fileData;

    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileSizeBytes = fileBuffer.length;

    console.log(`File size: ${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB`);

    // Insert initial contract record with pending status
    const insertResult = await sql`
      INSERT INTO contracts (
        company_id,
        software_id,
        contract_name,
        vendor_name,
        contract_type,
        file_name,
        file_size_bytes,
        file_type,
        file_url,
        analysis_status
      ) VALUES (
        ${data.companyId},
        ${data.softwareId || null},
        ${data.contractName},
        ${data.vendorName},
        ${data.contractType},
        ${data.fileName},
        ${fileSizeBytes},
        'pdf',
        ${data.fileData},
        'processing'
      )
      RETURNING id
    `;

    const contractId = insertResult[0].id;
    console.log(`Contract created with ID: ${contractId}`);

    try {
      // Step 1: Parse PDF
      console.log('Parsing PDF...');
      const contractText = await parsePDFContract(fileBuffer);

      if (!contractText || contractText.trim().length < 100) {
        throw new Error('PDF appears to be empty or unreadable');
      }

      console.log(`Extracted ${contractText.length} characters from PDF`);

      // Step 2: AI Analysis
      console.log('Running AI analysis...');
      const analysis: ContractAnalysisResult = await analyzeContract(
        contractText,
        data.vendorName,
        data.contractType
      );

      console.log(`AI analysis complete. Found ${analysis.risk_alerts.length} risk alerts`);

      // Step 3: Update contract with analysis results
      await sql`
        UPDATE contracts SET
          analysis_status = 'completed',
          analysis_completed_at = NOW(),
          contract_start_date = ${analysis.contract_start_date},
          contract_end_date = ${analysis.contract_end_date},
          renewal_date = ${analysis.renewal_date},
          notice_period_days = ${analysis.notice_period_days},
          auto_renewal = ${analysis.auto_renewal},
          cancellation_deadline = ${analysis.cancellation_deadline},
          contract_value = ${analysis.contract_value},
          payment_frequency = ${analysis.payment_frequency},
          payment_terms = ${analysis.payment_terms},
          price_increase_clause = ${analysis.price_increase_clause},
          price_increase_percentage = ${analysis.price_increase_percentage},
          termination_clause = ${analysis.termination_clause},
          early_termination_fee = ${analysis.early_termination_fee},
          refund_policy = ${analysis.refund_policy},
          liability_cap = ${analysis.liability_cap},
          data_retention_policy = ${analysis.data_retention_policy},
          sla_uptime_percentage = ${analysis.sla_uptime_percentage},
          sla_response_time = ${analysis.sla_response_time},
          sla_penalty_clause = ${analysis.sla_penalty_clause},
          intellectual_property_clause = ${analysis.intellectual_property_clause},
          confidentiality_clause = ${analysis.confidentiality_clause},
          warranty_clause = ${analysis.warranty_clause},
          indemnification_clause = ${analysis.indemnification_clause},
          dispute_resolution = ${analysis.dispute_resolution},
          governing_law = ${analysis.governing_law},
          full_text = ${analysis.full_text},
          ai_summary = ${analysis.ai_summary},
          key_highlights = ${JSON.stringify(analysis.key_highlights)},
          last_updated = NOW()
        WHERE id = ${contractId}
      `;

      console.log('Contract updated with analysis results');

      // Step 4: Create risk alerts
      if (analysis.risk_alerts && analysis.risk_alerts.length > 0) {
        for (const alert of analysis.risk_alerts) {
          await sql`
            INSERT INTO contract_risk_alerts (
              contract_id,
              company_id,
              risk_type,
              severity,
              title,
              description,
              potential_cost_impact,
              action_required,
              action_deadline,
              action_description
            ) VALUES (
              ${contractId},
              ${data.companyId},
              ${alert.risk_type},
              ${alert.severity},
              ${alert.title},
              ${alert.description},
              ${alert.potential_cost_impact},
              ${alert.action_required},
              ${alert.action_deadline},
              ${alert.action_description}
            )
          `;
        }
        console.log(`Created ${analysis.risk_alerts.length} risk alerts`);
      }

      // Step 5: Generate and create reminders
      const reminders = generateContractReminders(analysis, data.contractName);
      if (reminders.length > 0) {
        for (const reminder of reminders) {
          await sql`
            INSERT INTO contract_reminders (
              contract_id,
              company_id,
              reminder_type,
              reminder_date,
              days_before,
              title,
              message
            ) VALUES (
              ${contractId},
              ${data.companyId},
              ${reminder.reminder_type},
              ${reminder.reminder_date},
              ${reminder.days_before},
              ${reminder.title},
              ${reminder.message}
            )
          `;
        }
        console.log(`Created ${reminders.length} reminders`);
      }

      // Return success with full analysis
      return NextResponse.json({
        success: true,
        message: 'Contract uploaded and analyzed successfully',
        data: {
          contract_id: contractId,
          analysis: {
            ...analysis,
            file_size_mb: (fileSizeBytes / 1024 / 1024).toFixed(2)
          },
          risk_alerts_count: analysis.risk_alerts.length,
          reminders_count: reminders.length
        }
      });

    } catch (analysisError) {
      // Update contract with error status
      await sql`
        UPDATE contracts SET
          analysis_status = 'failed',
          analysis_error = ${analysisError instanceof Error ? analysisError.message : 'Analysis failed'}
        WHERE id = ${contractId}
      `;

      console.error('Contract analysis error:', analysisError);

      return NextResponse.json({
        success: false,
        error: 'Contract analysis failed',
        details: analysisError instanceof Error ? analysisError.message : 'Unknown error',
        contract_id: contractId,
        message: 'Contract was uploaded but automatic analysis failed. You can review it manually.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Contract upload error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
