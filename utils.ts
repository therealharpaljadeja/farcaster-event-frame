import { NextResponse } from "next/server";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export enum ResponseType {
    TICKET_AVAILABLE, // Slots available (default)
    NO_TICKET_AVAILABLE, // Slots not avialable
    RECAST, // Not liked and recasted
    DIETARY_RESTRICTIONS,
    EMAIL,
    ALREADY_RSVP, // Already RSVP'd
    ERROR,
    SUCCESS, // RSVP success, next is redirect to enter email / or keep dm open
}

export function getResponse(type: ResponseType) {
    const IMAGE = {
        [ResponseType.TICKET_AVAILABLE]: "status/ticket-available.png",
        [ResponseType.NO_TICKET_AVAILABLE]: "status/no-ticket-available.png",
        [ResponseType.RECAST]: "status/recast.png",
        [ResponseType.DIETARY_RESTRICTIONS]: "status/dietary-restrictions.png",
        [ResponseType.ALREADY_RSVP]: "status/already-rsvp.png",
        [ResponseType.ERROR]: "status/error.png",
        [ResponseType.EMAIL]: "status/email.png",
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
                        <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                    </head>
                </html>
            `);
        case ResponseType.DIETARY_RESTRICTIONS:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="fc:frame:button:1" content="Vegan" />
                        <meta property="fc:frame:button:2" content="Vegetarian" />
                        <meta property="fc:frame:button:3" content="None" />
                        <meta property="fc:frame:post_url" content="${process.env["HOST"]}/api/step2" />
                    </head>
                </html>
            `);
        case ResponseType.EMAIL:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="fc:frame:button:1" content="Submit" />
                        <meta property="fc:frame:post_url" content="${process.env["HOST"]}/api/step3" />
                        <meta property="fc:frame:input:text" content="Enter Email" />,
                    </head>
                </html>
            `);
        case ResponseType.NO_TICKET_AVAILABLE:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                    </head>
                </html>
            `);
        case ResponseType.RECAST:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        <meta property="fc:frame:button:1" content="Try Again" />
                        <meta property="fc:frame:post_url" content="${process.env["HOST"]}" />
                    </head>
                </html>
            `);
        case ResponseType.SUCCESS:
            return new NextResponse(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta property="fc:frame" content="vNext" />
                            <meta property="fc:frame:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                            <meta property="og:image" content="${process.env["HOST"]}/${RESPONSE_IMAGE}" />
                        </head>
                    </html>
                `);
        default:
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta property="fc:frame" content="vNext" />
                        <meta property="fc:frame:image" content="${
                            process.env["HOST"]
                        }/${IMAGE[ResponseType.ERROR]}" />
                        <meta property="og:image" content="${
                            process.env["HOST"]
                        }/${IMAGE[ResponseType.ERROR]}" />
                        <meta property="fc:frame:button:1" content="Try Again" />
                        <meta property="fc:frame:post_url" content="${
                            process.env["HOST"]
                        }" />
                    </head>
                </html>
            `);
    }

    return new NextResponse(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${
                    process.env["HOST"]
                }/${IMAGE[ResponseType.ERROR]}" />
                <meta property="og:image" content="${process.env["HOST"]}/${
        IMAGE[ResponseType.ERROR]
    }" />
                <meta property="fc:frame:button:1" content="Try Again" />
                <meta property="fc:frame:post_url" content="${
                    process.env["HOST"]
                }" />
            </head>
        </html>
    `);
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
        `${process.env.NEYNAR_HTTP_URL}/v2/farcaster/frame/validate`,
        options
    )
        .then((response) => response.json())
        .catch((err) => console.error(err));
}

export type User = {
    fid: number;
    username: string;
    eventAction: (typeof EVENT_ACTION)[number];
    dietaryRestriction: (typeof DIETARY_RESTRICTIONS)[number];
    rsvp: boolean;
};

export const EVENT_ACTION = ["ATTEND", "SHOW_AND_TELL"] as const;
export const DIETARY_RESTRICTIONS = ["VEGAN", "VEGETARIAN", "NONE"] as const;
