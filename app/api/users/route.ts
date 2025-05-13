import { NextRequest, NextResponse } from "next/server";
import { createUser, getUsers } from "@/services/user-service";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  try {
    const users = await getUsers(role as Role);
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
