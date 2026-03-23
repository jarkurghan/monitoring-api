import { Context } from "hono";
import { activePerTimes } from "./service";
import { activeUsersAndCities } from "./service";
import { cityCountsWithRegion } from "./service";
import { updatedUsersLast5Days } from "./service";
import { minMaxPrayerTimes } from "./service";
import { topCitiesByUsers } from "./service";
import { latestUsers } from "./service";
// import { perLanguage } from "./service";
import { countNulls } from "./service";
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

export const getUpdatedUsersLast5Days = async (c: Context) => {
    try {
        const stats = await updatedUsersLast5Days();
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

// ------------------------------------------------------- //

// export const getPerLanguage = async (c: Context) => {
//     try {
//         const stats = await perLanguage();
//         return c.json(stats);
//     } catch (error) {
//         c.status(500);
//         return c.json({ message: "Internal server error" });
//     }
// };

export const getCountNulls = async (c: Context) => {
    try {
        const stats = await countNulls();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getCityCount = async (c: Context) => {
    try {
        const stats = await topCitiesByUsers();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

export const getMinMaxPrayerTimes = async (c: Context) => {
    try {
        const stats = await minMaxPrayerTimes();
        return c.json(stats);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
};

