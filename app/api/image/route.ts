import { NextRequest, NextResponse } from 'next/server';
import { generateImageServer } from '../../../lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { word } = body;
    if (!word) return NextResponse.json({ error: 'Word required' }, { status: 400 });

    const imageUrl = await generateImageServer(word);
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('API Image Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}