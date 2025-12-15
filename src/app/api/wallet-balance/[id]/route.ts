import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://liquiditybars.com/canada/backend/admin/api/fetch_wallet_balance/${params.id}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: '0', message: 'Network error' },
      { status: 500 }
    );
  }
}
