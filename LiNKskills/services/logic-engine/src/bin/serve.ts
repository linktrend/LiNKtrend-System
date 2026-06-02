import { loadEnv } from "@linktrend/shared-config";
import { startLinkSkillsHttpServer } from "../http-server.js";

const env = loadEnv();
const port = Number(env.LINKSKILLS_HTTP_PORT ?? 3002);

startLinkSkillsHttpServer(env, port);
