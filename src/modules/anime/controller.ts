import type { Context } from "hono";
import { animeSummaryBasic } from "./service";
import { animeTopAnimes } from "./service";
import { animeTopDubs } from "./service";
import { animeTopUsers } from "./service";
import { animeUsersByStatus } from "./service";
import { animeDailyNewUsers } from "./service";
import { animeDailyTotalUsers } from "./service";
import { animeLatestAnimes } from "./service";

export const getAnimeSummaryBasic = async (c: Context) => {
    try {
        const stats = await animeSummaryBasic();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeTopDubs = async (c: Context) => {
    try {
        const rawTopCount = c.req.param("topCount");
        const topCount = Number.parseInt(rawTopCount ?? "", 10);

        if (!Number.isFinite(topCount) || Number.isNaN(topCount) || topCount < 1 || topCount > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'topCount' param. Expected integer 1..100." });
        }

        const stats = await animeTopDubs(topCount);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeTop5Dubs = async (c: Context) => {
    try {
        const stats = await animeTopDubs(20000);

        const top5Dubs = stats.slice(0, 2);
        top5Dubs.push({ dub_name: "Boshqalar", total_count: stats.slice(2).reduce((acc, curr) => acc + curr.total_count, 0), today_count: 0 });

        return c.json(top5Dubs.map((item) => ({ dub_name: item.dub_name, count: item.total_count })));
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeTopAnimes = async (c: Context) => {
    try {
        const rawTopCount = c.req.param("topCount");
        const topCount = Number.parseInt(rawTopCount ?? "", 10);

        if (!Number.isFinite(topCount) || Number.isNaN(topCount) || topCount < 1 || topCount > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'topCount' param. Expected integer 1..100." });
        }

        const stats = await animeTopAnimes(topCount);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeTop5Animes = async (c: Context) => {
    try {
        const stats = await animeTopAnimes(20000);

        const top5Animes = stats.slice(0, 4);
        top5Animes.push({ anime_name: "Boshqalar", total_count: stats.slice(4).reduce((acc, curr) => acc + curr.total_count, 0), today_count: 0 });

        return c.json(top5Animes.map((item) => ({ anime_name: item.anime_name, count: item.total_count })));
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeTopUsers = async (c: Context) => {
    try {
        const rawTopCount = c.req.param("topCount");
        const topCount = Number.parseInt(rawTopCount ?? "", 10);

        if (!Number.isFinite(topCount) || Number.isNaN(topCount) || topCount < 1 || topCount > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'topCount' param. Expected integer 1..100." });
        }

        const stats = await animeTopUsers(topCount);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeUsersByStatus = async (c: Context) => {
    try {
        const stats = await animeUsersByStatus();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeDailyNewUsers = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await animeDailyNewUsers(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeDailyTotalUsers = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await animeDailyTotalUsers(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getAnimeLatestAnimes = async (c: Context) => {
    try {
        const rawLimit = c.req.param("limit");
        const limit = Number.parseInt(rawLimit ?? "10", 10);

        const stats = await animeLatestAnimes(limit);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};
