import { ImageResponse } from "next/og";

export const runtime = "experimental-edge";

export async function GET(request: Request) {
    // const notoSerifKR = await fetch(
    //     new URL("../../public/NotoSerifKR-Regular.otf", import.meta.url)
    // ).then((res) => res.arrayBuffer());

    const { searchParams } = new URL(request.url);

    const hasTickets = searchParams.has("tickets");
    const tickets = hasTickets ? searchParams.get("tickets") : "0";

    const imageData = await fetch(
        new URL("../../public/start.png", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div tw="flex h-[1000px] w-[1900px] relative">
                <img
                    src={imageData as unknown as string}
                    tw="absolute left-0 top-0"
                />
                <div tw="flex flex-col text-left mt-[250px] ml-[100px] justify-center">
                    <h2 tw="z-10 text-black text-[150px]">{tickets}</h2>
                    <h4 tw="text-black text-[80px]">Tickets Available</h4>
                </div>
            </div>
        ),
        {
            width: 1900,
            height: 1000,
            // fonts: [
            //     {
            //         name: "NotoSerifKR",
            //         data: notoSerifKR,
            //         weight: 400,
            //     },
            // ],
        }
    );
}
