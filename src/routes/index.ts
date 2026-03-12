import { Hono } from "hono";
import demo from "./demo";
import pray from "./pray";

const routes = new Hono();

routes.route("/prayer-time", pray);
routes.route("/demo", demo);

export default routes;
