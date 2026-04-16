import type { Context } from "hono";
import { movieDailyNewUsers, movieSummaryBasic, movieUsersByStatus } from "./service";

export const getMovieSummaryBasic = async (c: Context) => {
    try {
        const stats = await movieSummaryBasic();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMovieDailyNewUsers = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await movieDailyNewUsers(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMovieUsersByStatus = async (c: Context) => {
    try {
        const stats = await movieUsersByStatus();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};
