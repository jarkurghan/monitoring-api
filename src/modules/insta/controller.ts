import type { Context } from "hono";
import { instaWeeklyCumulativeBeforeMondayTashkent } from "./service";
import { instaGroupsByStatus } from "./service";
import { instaUsersByStatus } from "./service";
import { instaSummaryBasic } from "./service";
import { instaTopGroups } from "./service";

export const getInstaSummaryBasic = async (c: Context) => {
    try {
        const stats = await instaSummaryBasic();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaWeeklyCounts = async (c: Context) => {
    try {
        const rawWeeks = c.req.param("weeks");
        const weeks = Number.parseInt(rawWeeks ?? "", 10);

        if (!Number.isFinite(weeks) || Number.isNaN(weeks) || weeks < 1 || weeks > 52) {
            c.status(400);
            return c.json({ message: "Invalid 'weeks' param. Expected integer 1..52." });
        }

        const stats = await instaWeeklyCumulativeBeforeMondayTashkent(weeks);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaUsersByStatus = async (c: Context) => {
    try {
        const stats = await instaUsersByStatus();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaGroupsByStatus = async (c: Context) => {
    try {
        const stats = await instaGroupsByStatus();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaTopGroups = async (c: Context) => {
    try {
        const rawGroups = c.req.param("groups");
        const groups = Number.parseInt(rawGroups ?? "", 10);

        if (!Number.isFinite(groups) || Number.isNaN(groups) || groups < 1 || groups > 100) {
            c.status(400);
            return c.json({ message: "Invalid 'groups' param. Expected integer 1..100." });
        }

        const stats = await instaTopGroups(groups);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};
