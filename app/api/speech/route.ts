import { NextRequest, NextResponse } from 'next/server';
import { generateSpeechServer } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang } = body;
    if (!text || !lang) return NextResponse.json({ error: 'Text and Lang required' }, { status: 400 });

    const audioData = await generateSpeechServer(text, lang as any);
    return NextResponse.json({ audioData });
  } catch (error: any) {
    console.error('API Speech Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}