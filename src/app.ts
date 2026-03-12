import { Hono } from "hono";
import { logger } from "hono/logger";
import routes from "./routes";

const app = new Hono();

app.use('*', logger())
app.route("/api", routes);

export default app;
