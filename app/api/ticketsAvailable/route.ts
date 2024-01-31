import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_TOKEN as string,
});

export async function GET(req: NextRequest): Promise<Response> {
    const ticketsAvailable = await redis.get("ticketsAvailable");

    return NextResponse.json(
        {
            ticketsAvailable,
        },
        { status: 200 }
    );
}
