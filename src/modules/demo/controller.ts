import type { Context } from "hono";

export const getDemo = async (c: Context) => {
    return c.json({ message: "Hello World" });
};