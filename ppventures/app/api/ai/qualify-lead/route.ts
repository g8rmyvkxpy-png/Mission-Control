import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'pp-15966-80-0-5f7a5dd3-92a2-40b5-a9a4-4c6eeab5c308-x';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, industry, website, description } = body;

    if (!company || !industry) {
      return NextResponse.json(
        { error: 'Company and industry are required' },
        { status: 400 }
      );
    }

    // Qualify lead using MiniMax
    const prompt = `Analyze this lead and provide a qualification score:

Company: ${company}
Industry: ${industry}
Website: ${website || 'Not provided'}
Description: ${description || 'Not provided'}

Provide your analysis in this exact format:
SCORE: [1-10]
FIT: [High/Medium/Low]
PAIN_POINTS: [List 2-3 specific pain points this company likely faces]
NEXT_STEP: [The best next action to take]

Be honest. If it's a low fit, say so.`;

    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales qualifier. You analyze leads and determine if they are a good fit for AI automation services. Be honest and objective.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    let qualification = {
      score: 5,
      fit: 'Medium',
      painPoints: ['Manual processes', 'Time constraints', 'Scaling challenges'],
      nextStep: 'Schedule discovery call'
    };

    if (response.ok) {
      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || '';
      
      // Parse the response
      const scoreMatch = analysis.match(/SCORE:\s*(\d+)/i);
      const fitMatch = analysis.match(/FIT:\s*(High|Medium|Low)/i);
      const painMatch = analysis.match(/PAIN_POINTS:\s*([\s\S]*?)(?=NEXT_STEP:|$)/i);
      const nextMatch = analysis.match(/NEXT_STEP:\s*(.+)/i);

      if (scoreMatch) qualification.score = parseInt(scoreMatch[1]);
      if (fitMatch) qualification.fit = fitMatch[1];
      if (painMatch) {
        const points = painMatch[1].split('\n').filter((p: string) => p.trim()).slice(0, 3);
        if (points.length > 0) qualification.painPoints = points;
      }
      if (nextMatch) qualification.nextStep = nextMatch[1].trim();
    }

    return NextResponse.json({
      success: true,
      qualification,
      company,
      industry
    });

  } catch (error) {
    console.error('Lead qualification error:', error);
    return NextResponse.json(
      { error: 'Failed to qualify lead' },
      { status: 500 }
    );
  }
}
