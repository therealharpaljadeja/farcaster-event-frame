import { NextRequest, NextResponse } from "next/server";
import { redis } from "../step1/route";

export async function GET(req: NextRequest): Promise<Response> {
    const ticketsAvailable = await redis.get("ticketsAvailable");

    return NextResponse.json(
        {
            ticketsAvailable,
        },
        { status: 200 }
    );
}
