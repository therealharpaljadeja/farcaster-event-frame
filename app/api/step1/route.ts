import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const HOST =
    "https://b980-2401-4900-1c20-7991-74c4-efee-5a1b-f225.ngrok-free.app";

export enum ResponseType {
    TICKET_AVAILABLE, // Slots available (default)
    NO_TICKET_AVAILABLE, // Slots not avialable
    RECAST, // Not liked and recasted
    DIETARY_RESTRICTIONS,
    ALREADY_RSVP, // Already RSVP'd
    ERROR,
    SUCCESS, // RSVP success, next is redirect to enter email / or keep dm open
}

export const EVENT_ACTION = ["ATTEND", "SHOW_AND_TELL"] as const;
export const DIETARY_RESTRICTIONS = ["VEGAN", "VEGETARIAN", "NONE"] as const;

const NEYNAR_API_KEY = "NEYNAR_API_DOCS";

export type User = {
    fid: number;
    username: string;
    eventAction: (typeof EVENT_ACTION)[number];
    dietaryRestriction: (typeof DIETARY_RESTRICTIONS)[number];
    rsvp: boolean;
};

export const redis = new Redis({
    url: "https://apn1-optimal-spaniel-33266.upstash.io",
    token: "AYHyASQgNzI1Y2I3NTgtODNjZi00MGM5LThjMjktNGJiMTkwYjk3NWJjNzcxYWQ3MmZjMGIxNGFkZDg1YmU4MmE5MDUxMTU0MzY=",
});

export function getResponse(type: ResponseType) {
    const IMAGE = {
        [ResponseType.TICKET_AVAILABLE]: "status/ticket-available.png",
        [ResponseType.NO_TICKET_AVAILABLE]: "status/no-ticket-available.png",
        [ResponseType.RECAST]: "status/recast.png",
        [ResponseType.DIETARY_RESTRICTIONS]: "status/dietary-restrictions.png",
        [ResponseType.ALREADY_RSVP]: "status/already-rsvp.png",
        [ResponseType.ERROR]: "status/error.png",
        [ResponseType.SUCCESS]: "status/success.png",
    };
    const RESPONSE_IMAGE = IMAGE[type];

    switch (type) {
        case ResponseType.ALREADY_RSVP:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${HOST}/${RESPONSE_IMAGE}" />
                    </head>
                </html>
            `);
        case ResponseType.DIETARY_RESTRICTIONS:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="fc:frame:button:1" content="Vegan" />
                        <meta property="fc:frame:button:2" content="Vegetarian" />
                        <meta property="fc:frame:button:3" content="None" />
                        <meta property="fc:frame:post_url" content="${HOST}/api/step2" />
                    </head>
                </html>
            `);
        case ResponseType.NO_TICKET_AVAILABLE:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${HOST}/${RESPONSE_IMAGE}" />
                    </head>
                </html>
            `);
        case ResponseType.RECAST:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        <meta property="fc:frame:button:1" content="Try Again" />
                        <meta property="fc:frame:post_url" content="${HOST}" />
                    </head>
                </html>
            `);
        case ResponseType.SUCCESS:
            return new NextResponse(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta property="fc:frame" content="vNext" />
                            <meta property="fc:frame:image" content="${HOST}/${RESPONSE_IMAGE}" />
                            <meta property="og:image" content="${HOST}/${RESPONSE_IMAGE}" />
                        </head>
                    </html>
                `);
        default:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${HOST}/${
                IMAGE[ResponseType.ERROR]
            }" />
                        <meta property="og:image" content="${HOST}/${
                IMAGE[ResponseType.ERROR]
            }" />
                        <meta property="fc:frame:button:1" content="Try Again" />
                        <meta property="fc:frame:post_url" content="${HOST}" />
                    </head>
                </html>
            `);
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    // Request from Warpcast
    const body: { trustedData?: { messageBytes?: string } } = await req.json();

    // Check if frame request is valid
    const status = await validateFrameRequest(body.trustedData?.messageBytes);

    if (!status?.valid) {
        console.error(status);
        throw new Error("Invalid frame request");
    }

    // // Check if user has liked and recasted
    // const hasLikedAndRecasted =
    //     !!status?.action?.cast?.viewer_context?.liked &&
    //     !!status?.action?.cast?.viewer_context?.recasted;

    // if (!hasLikedAndRecasted) {
    //     return getResponse(ResponseType.RECAST);
    // }

    const { fid, username } = status?.action?.interactor;

    const user = (await redis.get(fid)) as User;

    if (user?.rsvp) {
        return getResponse(ResponseType.ALREADY_RSVP);
    }

    const isTicketAvailable = await redis.get("ticketsAvailable");

    if (!isTicketAvailable) {
        return getResponse(ResponseType.NO_TICKET_AVAILABLE);
    }

    const tappedButton = status?.action.tapped_button.index;

    await redis.set(fid, {
        username,
        fid,
        eventAction: EVENT_ACTION[tappedButton - 1], // Frame buttons are 1 indexed
    });

    return getResponse(ResponseType.DIETARY_RESTRICTIONS);
}

export async function validateFrameRequest(data: string | undefined) {
    if (!NEYNAR_API_KEY) throw new Error("NEYNAR_API_KEY is not set");
    if (!data) throw new Error("No data provided");

    const options = {
        method: "POST",
        headers: {
            accept: "application/json",
            api_key: NEYNAR_API_KEY,
            "content-type": "application/json",
        },
        body: JSON.stringify({ message_bytes_in_hex: data }),
    };

    return await fetch(
        "https://api.neynar.com/v2/farcaster/frame/validate",
        options
    )
        .then((response) => response.json())
        .catch((err) => console.error(err));
}
