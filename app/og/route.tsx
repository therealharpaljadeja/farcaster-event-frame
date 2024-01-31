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
            <div tw="flex h-[950px] w-[500px] relative">
                <img
                    src={imageData as unknown as string}
                    tw="absolute left-0 top-0 h-[500px]"
                />
                <div tw="flex flex-col text-left mt-[-300px] ml-[50px] justify-center">
                    <h2 tw="z-10 text-black text-[48px]">{tickets}</h2>
                    <h4 tw="text-black mt-[-20px] text-[40px]">
                        Tickets Available
                    </h4>
                </div>
            </div>
        ),
        {
            width: 950,
            height: 500,
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
