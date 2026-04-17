import type { Context } from "hono";
import {
    movieDailyNewUsers,
    movieDailyTotalUsers,
    movieLatestMovies,
    movieSummaryBasic,
    movieTopActiveUsers,
    movieTopMovies,
    movieUsersByStatus,
} from "./service";

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

export const getMovieDailyTotalUsers = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await movieDailyTotalUsers(days);
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

export const getMovieTopMovies = async (c: Context) => {
    try {
        const rawTopCount = c.req.param("topCount");
        const topCount = Number.parseInt(rawTopCount ?? "", 10);

        if (!Number.isFinite(topCount) || Number.isNaN(topCount) || topCount < 1 || topCount > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'topCount' param. Expected integer 1..100." });
        }

        const stats = await movieTopMovies(topCount);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMovieTop5Movies = async (c: Context) => {
    try {
        const stats = await movieTopMovies(20000);

        const data = stats.slice(0, 4);
        data.push({
            description: "Boshqalar\n",
            total_count: stats.slice(4).reduce((acc, curr) => acc + curr.total_count, 0),
            today_count: 0,
            code: "",
            posts: "",
        });

        return c.json(data);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMovieTopActiveUsers = async (c: Context) => {
    try {
        const rawTopCount = c.req.param("topCount");
        const topCount = Number.parseInt(rawTopCount ?? "", 10);

        if (!Number.isFinite(topCount) || Number.isNaN(topCount) || topCount < 1 || topCount > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'topCount' param. Expected integer 1..100." });
        }

        const stats = await movieTopActiveUsers(topCount);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMovieLatestMovies = async (c: Context) => {
    try {
        const rawLimit = c.req.param("limit");
        const limit = Number.parseInt(rawLimit ?? "10", 10);

        if (!Number.isFinite(limit) || Number.isNaN(limit) || limit < 1 || limit > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'limit' param. Expected integer 1..100." });
        }

        const stats = await movieLatestMovies(limit);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};
