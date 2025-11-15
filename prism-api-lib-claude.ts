// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Refine feature request with Claude
export async function refineFeatureRequest(
  initialRequest: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are a product requirements analyst for PRISM, a SaaS portfolio optimization platform.

Your job is to help users refine their feature requests into clear, implementable requirements.

PRISM is built with:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL database

Guidelines for refinement:
1. Ask clarifying questions ONE at a time
2. Be specific about UI elements (colors, placement, sizing, components)
3. Confirm technical feasibility
4. Keep it conversational and friendly
5. After 2-3 exchanges, summarize the requirements and ask if they're final
6. Use examples to clarify ambiguous requests

Focus areas to clarify:
- WHAT exactly needs to change/be added?
- WHERE in the app (which page/component)?
- HOW should it look/behave?
- WHO can access it (all users, admins only)?
- WHEN should it appear (always, conditionally)?

Current feature request: "${initialRequest}"

Chat history so far:
${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}

${chatHistory.length < 2 ? 
  'This is the start of the conversation. Ask your first clarifying question.' :
  chatHistory.length < 4 ?
  'Continue refining the requirements with one more question.' :
  'You should have enough information now. Summarize the requirements clearly and ask if this is correct and final.'
}

Respond with your next message to the user.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: systemPrompt
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to refine feature request with AI');
  }
}

// Synthesize final requirements
export async function synthesizeRequirements(
  initialRequest: string,
  chatHistory: ChatMessage[]
): Promise<{
  summary: string;
  requirements: string;
  acceptanceCriteria: string[];
  filesLikelyModified: string[];
  estimatedComplexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';
  tags: string[];
}> {
  const synthesisPrompt = `Synthesize this feature request conversation into a clear, implementable requirement document.

Initial request: "${initialRequest}"

Full conversation:
${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n\n')}

Create a requirement document in JSON format with these fields:

{
  "summary": "One sentence summary of the feature",
  "requirements": "Detailed requirements in markdown format with bullet points",
  "acceptanceCriteria": ["Criterion 1", "Criterion 2", "..."],
  "filesLikelyModified": ["file/path1.tsx", "file/path2.ts", "..."],
  "estimatedComplexity": "trivial|simple|moderate|complex|very_complex",
  "tags": ["tag1", "tag2", "..."]
}

Complexity guidelines:
- trivial: Simple styling change (colors, fonts, spacing) - 1 file
- simple: UI component modification or new simple component - 1-3 files
- moderate: New feature with API + UI + database - 3-8 files
- complex: Multiple connected features - 8-15 files
- very_complex: Major architectural changes - 15+ files

Tags should include:
- Component type: ui, api, database, integration
- Feature area: dashboard, analytics, settings, etc.
- User type: client, admin, all
- Priority: quick-win, nice-to-have, strategic

Think about which Next.js files would need to be modified:
- For UI changes: app/(company)/[page]/page.tsx, components/[component].tsx
- For styling: app/globals.css, tailwind.config.ts
- For API: app/api/[endpoint]/route.ts
- For database: lib/db.ts, types/[model].ts

Output ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: synthesisPrompt
      }]
    });

    const jsonText = response.content[0].text;
    // Strip markdown code blocks if present
    const cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Failed to synthesize requirements:', error);
    throw new Error('Failed to synthesize requirements');
  }
}

// Generate implementation instructions for Claude Code
export async function generateImplementationInstructions(
  requirements: string,
  filesLikelyModified: string[]
): Promise<string> {
  const prompt = `Generate detailed implementation instructions for Claude Code CLI.

Requirements:
${requirements}

Files likely to be modified:
${filesLikelyModified.map(f => `- ${f}`).join('\n')}

Project context:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL with Neon

Output clear, step-by-step instructions that Claude Code can follow to implement this feature.

Format as markdown with:
1. Overview
2. Step-by-step implementation
3. Testing instructions
4. Rollback plan if something breaks

Be specific about:
- Exact file paths
- Code changes with before/after examples
- TypeScript types to add/modify
- Tailwind classes to use
- API endpoints to create/modify
- Database queries if needed

Keep instructions concise but complete.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Failed to generate implementation instructions:', error);
    throw new Error('Failed to generate implementation instructions');
  }
}
