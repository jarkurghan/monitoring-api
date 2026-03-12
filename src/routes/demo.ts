import { Hono } from "hono";
import * as controller from "@/modules/demo/controller";

const demo = new Hono();

demo.get("/", controller.getDemo);

export default demo;
