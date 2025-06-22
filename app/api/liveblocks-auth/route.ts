import { Liveblocks } from "@liveblocks/node";
import { v4 as uuidv4 } from "uuid";

const liveblocks = new Liveblocks({
    secret: process.env.NEXT_SECRET_LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
    // Get the current user from your database
    const anonymousUserId = uuidv4();

    // Start an auth session inside your endpoint
    const session = liveblocks.prepareSession(
        anonymousUserId,
        // { userInfo: user.metadata } // Optional
    );

    // Use a naming pattern to allow access to rooms with wildcards
    // Giving the user read access on their org, and write access on their group
    session.allow(`*`, session.READ_ACCESS);
    session.allow(`*`, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    return new Response(body, { status });
}