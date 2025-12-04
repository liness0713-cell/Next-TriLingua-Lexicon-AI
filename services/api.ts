import { WordData, SentenceData } from "../types";

export class ApiService {
  
  async analyzeWord(query: string): Promise<WordData> {
    const res = await fetch('/api/word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to analyze word');
    return res.json();
  }

  async analyzeSentence(query: string): Promise<SentenceData> {
    const res = await fetch('/api/sentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to analyze sentence');
    return res.json();
  }

  async generateImage(word: string): Promise<string | null> {
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.imageUrl;
  }

  async playSpeech(text: string, lang: 'jp' | 'en' | 'zh'): Promise<void> {
    try {
      const res = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      
      if (!res.ok) return;
      const data = await res.json();
      const base64Audio = data.audioData;
      
      if (!base64Audio) return;

      // Decode and play on client
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (e) {
      console.error("Speech playback failed", e);
    }
  }
}

export const apiService = new ApiService();