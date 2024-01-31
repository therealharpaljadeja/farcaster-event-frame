import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
    const response = await fetch(
        `${process.env["HOST"]}/api/ticketsAvailable`,
        {
            method: "GET",
        }
    );

    const { ticketsAvailable } = await response.json();

    const imageUrl = `${process.env["HOST"]}/og?tickets=${ticketsAvailable}`;

    return {
        title: "Consumer Crypto Space at Celo Center",
        description:
            "​Join us at the Celo Foundation San Francisco headquarters for an inspiring, three-day coworking event right before ETHDenver!",
        openGraph: {
            title: "Consumer Crypto Space",
            images: [imageUrl],
        },
        other: {
            "fc:frame": "vNext",
            "fc:frame:image": imageUrl,
            "fc:frame:post_url": `${process.env["HOST"]}/api/step1`,
            "fc:frame:button:1": "Attend",
            "fc:frame:button:2": "Show & Tell",
        },
    };
}

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center space-y-4 p-24">
            <h2>Consumer Crypto Space at Celo Center</h2>
            <Link href="https://lu.ma/v6iz9u0j">
                <h3 className="underline">Click here to apply</h3>
            </Link>
        </main>
    );
}
