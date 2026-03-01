// app/api/verify-admin/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { inputCode } = await request.json();
  const isValid = inputCode === process.env.ADMIN_CODE_1 || inputCode === process.env.ADMIN_CODE_2;

  return NextResponse.json({ authorized: isValid });
}