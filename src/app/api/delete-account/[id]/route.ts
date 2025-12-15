import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://liquiditybars.com/canada/backend/admin/api/delete_account/${params.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { status: '0', message: 'Network error' },
      { status: 500 }
    );
  }
}
