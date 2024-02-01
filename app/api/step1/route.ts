import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
    EVENT_ACTION,
    ResponseType,
    User,
    getResponse,
    validateFrameRequest,
} from "@/utils";

const redis = new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_TOKEN as string,
});

export async function POST(req: NextRequest): Promise<Response> {
    // Request from Warpcast
    const body: { trustedData?: { messageBytes?: string } } = await req.json();

    // Check if frame request is valid
    const status = await validateFrameRequest(body.trustedData?.messageBytes);

    if (!status?.valid) {
        console.error(status);
        throw new Error("Invalid frame request");
    }

    const tappedButton = status?.action.tapped_button.index;
    const ticketsAvailable = await redis.get("ticketsAvailable");

    if (tappedButton === 3) {
        return new NextResponse(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${process.env["HOST"]}/og?tickets=${ticketsAvailable}" />
                <meta property="og:image" content="${process.env["HOST"]}/og?tickets=${ticketsAvailable}" />
                <meta property="fc:frame:post_url" content="${process.env["HOST"]}/api/step1" />
                <meta property="fc:frame:button:1" content="Attend" />
                <meta property="fc:frame:button:2" content="Show & Tell (2/22)" />
                <meta property="fc:frame:button:3" content="Refresh" />
            </head>
        </html>
    `);
    }

    // Check if user has liked and recasted
    const hasLikedAndRecasted =
        !!status?.action?.cast?.viewer_context?.liked &&
        !!status?.action?.cast?.viewer_context?.recasted;

    if (!hasLikedAndRecasted) {
        return getResponse(ResponseType.RECAST);
    }

    const { fid, username } = status?.action?.interactor;

    const user = (await redis.get(fid)) as User;

    if (user?.rsvp) {
        return getResponse(ResponseType.ALREADY_RSVP);
    }

    const isTicketAvailable = await redis.get("ticketsAvailable");

    if (!isTicketAvailable) {
        return getResponse(ResponseType.NO_TICKET_AVAILABLE);
    }

    await redis.set(fid, {
        username,
        fid,
        eventAction: EVENT_ACTION[tappedButton - 1], // Frame buttons are 1 indexed
    });

    return getResponse(ResponseType.DIETARY_RESTRICTIONS);
}
