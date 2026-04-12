import { Hono } from "hono";
import insta from "./insta";
import anime from "./anime";
import demo from "./demo";
import pray from "./pray";

const routes = new Hono();

routes.route("/prayer-time", pray);
routes.route("/insta-saver", insta);
routes.route("/anime", anime);
routes.route("/demo", demo);

export default routes;
