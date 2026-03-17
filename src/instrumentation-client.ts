import { initBotId } from "botid/client/core";
import { botIdProtectedRoutes } from "@/lib/botid";

initBotId({
  protect: botIdProtectedRoutes,
});
