// app/api/features/refine/route.ts

import { NextResponse } from 'next/server';
import { requireAuth, canAccessFeatureRequest } from '@/lib/auth';
import { featureQueries } from '@/lib/db';
import { refineFeatureRequest } from '@/lib/claude';
import type { RefineFeatureRequestBody, RefineFeatureRequestResponse, ChatMessage } from '@/types/features';

export async function POST(req: Request) {
  try {
    // Authenticate user
    const user = await requireAuth(req);
    
    // Parse request body
    const body: RefineFeatureRequestBody = await req.json();
    
    // Validate input
    if (!body.featureId) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check access
    const hasAccess = await canAccessFeatureRequest(user.id, body.featureId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Feature request not found or access denied' },
        { status: 404 }
      );
    }

    // Get feature request
    const feature = await featureQueries.findById(body.featureId);
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (feature.status !== 'refining') {
      return NextResponse.json(
        { error: 'Feature request is no longer in refinement stage' },
        { status: 400 }
      );
    }

    // Get chat history
    const chatHistory: ChatMessage[] = feature.chat_history || [];
    
    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: body.message.trim(),
      timestamp: new Date().toISOString(),
    };
    
    chatHistory.push(userMessage);

    // Check if user indicated this is final
    const isFinalIntent = /\b(yes|correct|final|that'?s it|perfect|good|exactly|confirmed?)\b/i.test(body.message);
    
    if (isFinalIntent && chatHistory.length >= 3) {
      // User confirmed requirements are final
      const response: RefineFeatureRequestResponse = {
        message: '✅ Perfect! Your feature request has been submitted for admin approval. You\'ll receive a notification once it\'s deployed!',
        isReadyToFinalize: true,
      };

      // Add final message to chat
      chatHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      });

      // Update chat history
      await featureQueries.updateChatHistory(body.featureId, chatHistory);

      return NextResponse.json(response);
    }

    // Get AI refinement response
    const aiResponse = await refineFeatureRequest(
      feature.initial_request,
      chatHistory
    );

    // Add AI message to history
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };
    
    chatHistory.push(aiMessage);

    // Update database
    await featureQueries.updateChatHistory(body.featureId, chatHistory);

    const response: RefineFeatureRequestResponse = {
      message: aiResponse,
      isReadyToFinalize: false,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error refining feature request:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to refine feature request' },
      { status: 500 }
    );
  }
}
