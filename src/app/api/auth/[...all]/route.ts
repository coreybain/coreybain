import { authServer } from "@/lib/auth-server";
import {
  ADMIN_SIGN_IN_API_PATH,
  AUTH_BOT_BLOCK_MESSAGE,
} from "@/lib/botid";
import { verifyBotId } from "@/lib/server/botid";

export const GET = authServer.handler.GET;

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname === ADMIN_SIGN_IN_API_PATH) {
    const botCheck = await verifyBotId(request);

    if (botCheck.isBot) {
      return Response.json(
        {
          error: {
            message: AUTH_BOT_BLOCK_MESSAGE,
          },
        },
        { status: 403 }
      );
    }
  }

  return authServer.handler.POST(request);
}
