import { ImageResponse } from "next/og";

export const runtime = "experimental-edge";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const tickets = searchParams.get("tickets");

    return new ImageResponse(
        (
            <div tw="flex h-[421px] w-[800px] relative">
                <img
                    src={"https://i.postimg.cc/nc3t7rHF/start.png"}
                    tw="absolute left-0 top-0 h-[421px]"
                />
                <div tw="flex flex-col text-left mt-[100px] ml-[45px] justify-center">
                    <h2 tw="z-10 text-black text-[36px]">{tickets}</h2>
                    <h4 tw="text-black mt-[-20px] text-[24px]">Tickets Only</h4>
                </div>
            </div>
        ),
        {
            width: 800,
            height: 421,
        }
    );
}
