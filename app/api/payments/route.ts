// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPayment, getPayments } from "@/services/payment-service";

export async function GET(req: NextRequest) {
  // opcionalmente filtrar por clientId: /api/payments?clientId=123
  const clientId = req.nextUrl.searchParams.get("clientId");

  try {
    const payments = await getPayments(clientId);
    return NextResponse.json(payments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    const payment = await createPayment(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
