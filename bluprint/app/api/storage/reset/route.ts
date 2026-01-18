import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '.bluprint-storage.json');

export async function POST() {
  try {
    const state = {
      unlocked: false,
      timestamp: 0,
      items: [],
    };

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(state, null, 2));

    console.log('[BluPrint API] Storage reset');

    return NextResponse.json({
      success: true,
      message: 'Storage reset',
      state,
    });
  } catch (error) {
    console.error('[BluPrint API] Error resetting storage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset storage' },
      { status: 500 }
    );
  }
}
