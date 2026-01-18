import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '.bluprint-storage.json');

export async function GET() {
  try {
    let state = {
      unlocked: false,
      timestamp: 0,
      items: [] as string[],
    };

    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      state = JSON.parse(data);
    }

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error('[BluPrint API] Error reading storage status:', error);
    return NextResponse.json(
      {
        success: true,
        state: { unlocked: false, timestamp: 0, items: [] },
      }
    );
  }
}
