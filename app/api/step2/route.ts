import { NextRequest } from "next/server";

import {
    DIETARY_RESTRICTIONS,
    ResponseType,
    User,
    getResponse,
    validateFrameRequest,
} from "@/utils";

import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_TOKEN as string,
});

export async function POST(req: NextRequest): Promise<Response> {
    const body: { trustedData?: { messageBytes?: string } } = await req.json();

    // Check if frame request is valid
    const status = await validateFrameRequest(body.trustedData?.messageBytes);

    console.log(status);

    if (!status?.valid) {
        console.error(status);
        throw new Error("Invalid frame request");
    }

    const { fid } = status.action.interactor;
    const tappedButton = status?.action.tapped_button.index;

    let user = (await redis.get(fid)) as User;

    await redis.set(fid, {
        ...user,
        dietaryRestriction: DIETARY_RESTRICTIONS[tappedButton - 1],
        rsvp: true,
    });

    await redis.decr("ticketsAvailable");

    return getResponse(ResponseType.SUCCESS);
}
