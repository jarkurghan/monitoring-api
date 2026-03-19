import { queryCityWithCountOrderByCountDesc } from "./repository";
import { queryDistinctCityCountActiveUsers } from "./repository";
import { queryActiveUsersCountByTime } from "./repository";
import { queryUpdatedUsersLastDays } from "./repository";
import { queryAnyActiveCityDateUz } from "./repository";
import { queryUsersOrderByIdDesc } from "./repository";
import { queryCountUsersByStatus } from "./repository";
import { queryCountActiveUsers } from "./repository";
import { queryCountAllUsers } from "./repository";
import { readFile } from "node:fs/promises";

export async function activePerTimes() {
    try {
        type PrayerTimeStat = { hour: number; count: number };
        const rows = await queryActiveUsersCountByTime;
        const statsMap = new Map<number, number>();

        for (let hour = 1; hour < 24; hour++) {
            statsMap.set(hour, 0);
        }

        for (const row of rows) {
            if (row.time == null) continue;
            const hour = Number(row.time);
            if (hour < 0 || hour > 23) continue;
            statsMap.set(hour, Number(row.count));
        }

        const stats: PrayerTimeStat[] = Array.from(statsMap.entries()).map(([time, count]) => ({ hour: time, count }));

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function userStatus() {
    try {
        const counts = await queryCountUsersByStatus;

        const obj = counts.reduce<Record<string, number>>((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {});

        const stats = [
            { status: "Yangi", count: obj.new || 0 },
            { status: "Aktiv", count: obj.active || 0 },
            { status: "O'chirilgan", count: (obj.has_blocked || 0) + (obj.inactive || 0) },
            { status: "Boshqa", count: (obj.other || 0) + (obj.deleted_account || 0) },
        ];

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

type Status = "new" | "active" | "inactive" | "deleted_account" | "has_blocked" | "other";

type ActiveUserRow = {
    city: number | null;
    time: number | null;
    language: number | null;
    tg_id?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    username?: unknown;
    status: Status;
};

const checkStatus = (status: Status) => {
    switch (status) {
        case "active":
            return "Aktiv";
        case "deleted_account":
            return "Boshqa";
        case "has_blocked":
            return "O'chirilgan";
        case "inactive":
            return "O'chirilgan";
        case "new":
            return "Yangi";
        case "other":
            return "Boshqa";

        default:
            return "Boshqa";
    }
};

export async function latestUsers() {
    try {
        type CityInfo = { id: string; name_1: string; name_2: string; viloyat_1: string; viloyat_2: string };
        const users: ActiveUserRow[] = await queryUsersOrderByIdDesc.limit(10);

        const citiesJson = await readFile("src/utils/cities.json", "utf8");
        const cities: CityInfo[] = JSON.parse(citiesJson);
        const citiesById = new Map<string, CityInfo>(cities.map((c) => [c.id, c]));

        const usersForStats = users.map((user) => {
            const { city, time, language, tg_id, first_name, last_name, username, status, ...rest } = user;

            const cityName =
                city == null ? null : language === 1 ? (citiesById.get(String(city))?.name_1 ?? null) : (citiesById.get(String(city))?.name_2 ?? null);
            const regionName =
                city == null ? null : language === 1 ? (citiesById.get(String(city))?.viloyat_1 ?? null) : (citiesById.get(String(city))?.viloyat_2 ?? null);

            const formattedTime = time == null || Number.isNaN(Number(time)) ? null : `${String(Number(time)).padStart(2, "0")}:00`;

            return { ...rest, city: cityName, region: regionName, time: formattedTime, status: checkStatus(status) };
        });

        return usersForStats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function updatedUsersLastDays(days: number) {
    try {
        type Row = { date: string; count: number };
        const rows: Row[] = await queryUpdatedUsersLastDays(days);

        const countsByDate = new Map<string, number>();
        for (const row of rows) {
            if (!row.date) continue;
            countsByDate.set(row.date, row.count);
        }

        const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

        const stats: { date: string; weekday: string; count: number }[] = [];

        const today = new Date();
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const dateStr = d.toISOString().slice(0, 10);
            const weekday = weekdayNames[d.getDay()];
            const count = countsByDate.get(dateStr) ?? 0;

            stats.push({ date: dateStr.split("-").reverse().join("."), weekday, count });
        }

        return stats.reverse();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function activeUsersAndCities() {
    try {
        const [usersRow] = await queryCountActiveUsers;
        const [citiesRow] = await queryDistinctCityCountActiveUsers;
        const [allUsersRow] = await queryCountAllUsers;
        const [dateRow] = await queryAnyActiveCityDateUz;

        const stats = {
            date: { title: "", date: "", weekday: "" },
            stats: [
                { title: "Hududlar soni", count: citiesRow?.count ?? 0 },
                { title: "Barcha foydalanuvchilar soni", count: allUsersRow?.count ?? 0 },
                { title: "Aktiv foydalanuvchilar soni", count: usersRow?.count ?? 0 },
            ],
        };

        if (dateRow?.date) {
            const dateArr = (dateRow?.date || "").split("\n");
            stats.date = { title: dateArr[2], date: dateArr[1].split(" ")[0], weekday: dateArr[0] };
        } else {
            stats.date = { title: "", date: "", weekday: "" };
        }

        return stats;
    } catch (error) {
        console.error(error);
        return { date: { title: "", date: "", weekday: "" }, stats: [] };
    }
}

export async function cityCountsWithRegion() {
    try {
        type CityRow = { city: number | null; count: number };
        type CityInfo = { id: string; viloyat_2: string };

        const rows: CityRow[] = await queryCityWithCountOrderByCountDesc;

        const citiesJson = await readFile("src/utils/cities.json", "utf8");
        const cities: CityInfo[] = JSON.parse(citiesJson);
        const citiesById = new Map<string, CityInfo>(cities.map((c) => [c.id, c]));

        const regionCounts = new Map<string, number>();

        for (const row of rows) {
            if (row.city == null) continue;
            const cityInfo = citiesById.get(String(row.city));
            if (!cityInfo?.viloyat_2) continue;

            const prev = regionCounts.get(cityInfo.viloyat_2) ?? 0;
            regionCounts.set(cityInfo.viloyat_2, prev + row.count);
        }

        const stats = Array.from(regionCounts.entries())
            .map(([viloyat_2, count]) => ({ viloyat: viloyat_2, count }))
            .sort((a, b) => b.count - a.count);

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function cityCountsByRegionName(regionName: string) {
    try {
        type CityRow = { city: number | null; count: number };
        type CityInfo = { id: string; name_2: string; viloyat_2: string };

        const citiesJson = await readFile("src/utils/cities.json", "utf8");
        const cities: CityInfo[] = JSON.parse(citiesJson).filter((c: CityInfo) => c.viloyat_2.toLowerCase() === regionName.toLowerCase());

        const rows: CityRow[] = await queryCityWithCountOrderByCountDesc;

        const stats = rows
            .map((row) => {
                const cityInfo = cities.find((c) => c.id === String(row.city));
                return { city_id: row.city, count: row.count, name_2: cityInfo?.name_2 ?? null };
            })
            .filter((row) => row.name_2 != null);

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}
