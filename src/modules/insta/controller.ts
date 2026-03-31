import type { Context } from "hono";
import {
    instaNewGroupsLastDays,
    instaNewUsersAndGroupsLastDays,
    instaNewUsersAndGroupsLastWeeks,
    instaNewUsersLastDays,
    instaSummaryBasic,
    instaSummaryWithToday,
    instaTopGroups,
    instaGroupsByStatus,
    instaUsersByStatus,
} from "./service";

export const getInstaSummaryBasic = async (c: Context) => {
    try {
        const stats = await instaSummaryBasic();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaSummaryWithToday = async (c: Context) => {
    try {
        const stats = await instaSummaryWithToday();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaNewUsersLastDays = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await instaNewUsersLastDays(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaNewGroupsLastDays = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await instaNewGroupsLastDays(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaNewUsersAndGroupsLastDays = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await instaNewUsersAndGroupsLastDays(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getInstaNewUsersAndGroupsLastWeeks = async (c: Context) => {
    try {
        const rawWeeks = c.req.param("weeks");
        const weeks = Number.parseInt(rawWeeks ?? "", 10);

        if (!Number.isFinite(weeks) || Number.isNaN(weeks) || weeks < 1 || weeks > 26) {
            c.status(400);
            return c.json({ message: "Invalid 'weeks' param. Expected integer 1..26." });
        }

        const stats = await instaNewUsersAndGroupsLastWeeks(weeks);
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

