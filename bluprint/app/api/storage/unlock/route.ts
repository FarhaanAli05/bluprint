import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory storage for demo (resets on server restart)
// For production, use a database
let storageState = {
  unlocked: false,
  timestamp: 0,
  items: [] as string[],
};

// Also persist to file for reliability across server restarts
const STORAGE_FILE = path.join(process.cwd(), '.bluprint-storage.json');

function loadState() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      storageState = JSON.parse(data);
    }
  } catch (error) {
    console.error('[BluPrint API] Error loading storage state:', error);
  }
}

function saveState() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storageState, null, 2));
  } catch (error) {
    console.error('[BluPrint API] Error saving storage state:', error);
  }
}

// Load state on module initialization
loadState();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    storageState = {
      unlocked: true,
      timestamp: Date.now(),
      items: body.items || ['bookshelf_demo'],
    };

    saveState();

    console.log('[BluPrint API] Storage unlocked:', storageState);

    return NextResponse.json({
      success: true,
      message: 'Storage unlocked',
      state: storageState,
    });
  } catch (error) {
    console.error('[BluPrint API] Error unlocking storage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlock storage' },
      { status: 500 }
    );
  }
}

export async function GET() {
  loadState(); // Reload state in case file was updated
  return NextResponse.json({
    success: true,
    state: storageState,
  });
}
