import { queryCityWithCountOrderByCountDesc } from "./repository";
import { queryDistinctCityCountActiveUsers } from "./repository";
// import { queryCountTimeNotNullAndInactive } from "./repository";
// import { queryCountTimeNotNullAndActive } from "./repository";
// import { queryActiveUsersOrderByIdDesc } from "./repository";
// import { queryCountTimeNullAndInactive } from "./repository";
// import { queryCountTimeNullAndActive } from "./repository";
import { queryActiveUsersCountByTime } from "./repository";
import { queryUpdatedUsersLast5Days } from "./repository";
// import { queryActiveUsersByLanguage } from "./repository";
import { queryAnyActiveCityDateUz } from "./repository";
import { queryAllUsersByLanguage } from "./repository";
import { queryUsersOrderByIdDesc } from "./repository";
import { queryCountUsersByStatus } from "./repository";
import { queryCountLanguageNull } from "./repository";
import { queryCountActiveUsers } from "./repository";
import { queryPtCityAndTimes } from "./repository";
import { queryCountAllUsers } from "./repository";
import { queryCountCityNull } from "./repository";
import { queryCountTimeNull } from "./repository";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

function minBy<T>(items: T[], getValue: (item: T) => string) {
    let result: T | null = null;
    for (const item of items) {
        const value = getValue(item);
        if (!value) continue;
        if (result === null || value < getValue(result)) {
            result = item;
        }
    }
    return result;
}

function maxBy<T>(items: T[], getValue: (item: T) => string) {
    let result: T | null = null;
    for (const item of items) {
        const value = getValue(item);
        if (!value) continue;
        if (result === null || value > getValue(result)) {
            result = item;
        }
    }
    return result;
}

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

export async function updatedUsersLast5Days() {
    try {
        type Row = { date: string; count: number };
        const rows: Row[] = await queryUpdatedUsersLast5Days;

        const countsByDate = new Map<string, number>();
        for (const row of rows) {
            if (!row.date) continue;
            countsByDate.set(row.date, row.count);
        }

        const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

        const stats: { date: string; weekday: string; count: number }[] = [];

        const today = new Date();
        for (let i = 0; i < 5; i++) {
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

// ------------------------------------------------------- //

// export async function perLanguage() {
//     try {
//         const all = await queryAllUsersByLanguage;
//         const active = await queryActiveUsersByLanguage;

//         const stats = {
//             cyrill: { all: all.find((row) => row.language === 1)?.count ?? 0, active: active.find((row) => row.language === 1)?.count ?? 0 },
//             latin: { all: all.find((row) => row.language === 2)?.count ?? 0, active: active.find((row) => row.language === 2)?.count ?? 0 },
//         };

//         await writeFile("src/modules/pray/stats/per-language.json", JSON.stringify(stats, null, 2), "utf8");
//     } catch (error) {
//         console.error(error);
//     }
// }

export async function countNulls() {
    try {
        const [languageNull] = await queryCountLanguageNull;
        const [cityNull] = await queryCountCityNull;
        const [timeNull] = await queryCountTimeNull;

        // const language = languageNull?.count ?? 0;
        // const city = (cityNull?.count ?? 0) - language;
        // const time = (timeNull?.count ?? 0) - (city + language);
        const language = languageNull?.count ?? 0;
        const city = cityNull?.count ?? 0;
        const time = timeNull?.count ?? 0;

        const stats = { language, city, time };
        await writeFile("src/modules/pray/stats/count-nulls.json", JSON.stringify(stats, null, 2), "utf8");
    } catch (error) {
        console.error(error);
    }
}

export async function topCitiesByUsers() {
    try {
        type CityRow = { city: number | null; count: number };
        type CityInfo = { id: string; name_1: string; name_2: string };

        const rows: CityRow[] = await queryCityWithCountOrderByCountDesc.limit(10);

        const citiesJson = await readFile("src/utils/cities.json", "utf8");
        const cities: CityInfo[] = JSON.parse(citiesJson);
        const citiesById = new Map<string, CityInfo>(cities.map((c) => [c.id, c]));

        const stats = rows
            .filter((row) => row.city != null)
            .map((row) => {
                const cityInfo = citiesById.get(String(row.city));
                return { city_id: row.city, count: row.count, name_1: cityInfo?.name_1 ?? null, name_2: cityInfo?.name_2 ?? null };
            });

        await writeFile("src/modules/pray/stats/city-count.json", JSON.stringify(stats, null, 2), "utf8");
    } catch (error) {
        console.error(error);
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
    }
}

export async function minMaxPrayerTimes() {
    try {
        type RowWithTimes = { city: number; tong: string; quyosh: string; peshin: string; asr: string; shom: string; xufton: string };
        const rows: RowWithTimes[] = await queryPtCityAndTimes;

        const stats = {
            tong: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.tong);
                    return row ? { time: row.tong, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.tong);
                    return row ? { time: row.tong, city: row.city } : null;
                })(),
            },
            quyosh: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.quyosh);
                    return row ? { time: row.quyosh, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.quyosh);
                    return row ? { time: row.quyosh, city: row.city } : null;
                })(),
            },
            peshin: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.peshin);
                    return row ? { time: row.peshin, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.peshin);
                    return row ? { time: row.peshin, city: row.city } : null;
                })(),
            },
            asr: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.asr);
                    return row ? { time: row.asr, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.asr);
                    return row ? { time: row.asr, city: row.city } : null;
                })(),
            },
            shom: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.shom);
                    return row ? { time: row.shom, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.shom);
                    return row ? { time: row.shom, city: row.city } : null;
                })(),
            },
            xufton: {
                earliest: (() => {
                    const row = minBy(rows, (r) => r.xufton);
                    return row ? { time: row.xufton, city: row.city } : null;
                })(),
                latest: (() => {
                    const row = maxBy(rows, (r) => r.xufton);
                    return row ? { time: row.xufton, city: row.city } : null;
                })(),
            },
        };

        await writeFile("src/modules/pray/stats/min-max-prayer-times.json", JSON.stringify(stats, null, 2), "utf8");
    } catch (error) {
        console.error(error);
    }
}
