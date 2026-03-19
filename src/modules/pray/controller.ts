import { Context } from "hono";
import { activePerTimes } from "./service";
import { cityCountsByRegionName } from "./service";
import { activeUsersAndCities } from "./service";
import { cityCountsWithRegion } from "./service";
import { updatedUsersLastDays } from "./service";
import { latestUsers } from "./service";
import { userStatus } from "./service";

export const getActivePerTimes = async (c: Context) => {
    try {
        const stats = await activePerTimes();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getLatestUsers = async (c: Context) => {
    try {
        const stats = await latestUsers();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getUpdatedUsersLastDays = async (c: Context) => {
    try {
        const rawDays = c.req.param("days");
        const days = Number.parseInt(rawDays ?? "", 10);

        if (!Number.isFinite(days) || Number.isNaN(days) || days < 1 || days > 365) {
            c.status(400);
            return c.json({ message: "Invalid 'days' param. Expected integer 1..365." });
        }

        const stats = await updatedUsersLastDays(days);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getUserStatus = async (c: Context) => {
    try {
        const stats = await userStatus();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getActiveUsersAndCities = async (c: Context) => {
    try {
        const stats = await activeUsersAndCities();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getCityCountsWithRegion = async (c: Context) => {
    try {
        const stats = await cityCountsWithRegion();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getCityCountsByRegionName = async (c: Context) => {
    try {
        const regionName = c.req.param("region");
        const stats = await cityCountsByRegionName(regionName!);
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};
