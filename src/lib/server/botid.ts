import { checkBotId } from "botid/server";
import { BOT_ID_CHECK_LEVEL } from "@/lib/botid";

export async function verifyBotId(request: Request) {
  return checkBotId({
    developmentOptions:
      process.env.NODE_ENV === "development"
        ? {
            bypass: "HUMAN",
          }
        : undefined,
    advancedOptions: {
      checkLevel: BOT_ID_CHECK_LEVEL,
      headers: Object.fromEntries(request.headers.entries()),
    },
  });
}
