import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'pp-15966-80-0-5f7a5dd3-92a2-40b5-a9a4-4c6eeab5c308-x';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, industry, website, name } = body;

    if (!company || !industry) {
      return NextResponse.json(
        { error: 'Company and industry are required' },
        { status: 400 }
      );
    }

    // Generate personalized outreach using MiniMax
    const prompt = `Generate a short, personalized cold outreach message for a ${industry} company called "${company}" (${website || 'website not provided'}).

The message should:
- Be 3-4 sentences max
- Be conversational, not salesy
- Mention one specific pain point for ${industry} businesses
- Include a clear CTA
- Be under 100 words

Write in a helpful, professional tone.`;

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
            content: 'You are an expert sales copywriter who specializes in cold outreach. You write personalized, concise messages that get responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      // Fallback message
      return NextResponse.json({
        success: true,
        message: `Hi${name ? ' ' + name : ''},

I help ${industry} companies like ${company} save 10+ hours every week through automation.

Would you be open to a quick 5-minute chat to see what's possible?

Best`,
        source: 'fallback'
      });
    }

    const data = await response.json();
    const outreachMessage = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      message: outreachMessage,
      source: 'minimax'
    });

  } catch (error) {
    console.error('Outreach generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
