import { NextRequest, NextResponse } from 'next/server';
import { analyzeWordServer } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

    const data = await analyzeWordServer(query);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Word Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}