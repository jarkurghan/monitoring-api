import { queryTotalUsers } from "./repository";
import { queryTotalGroups } from "./repository";
import { queryUsersByStatus } from "./repository";
import { queryGroupsByStatus } from "./repository";
import { queryTotalUserUsages } from "./repository";
import { queryTotalGroupUsages } from "./repository";
import { queryNewUsersLastDays } from "./repository";
import { queryNewGroupsLastDays } from "./repository";
import { queryNewUsersLastWeeks } from "./repository";
import { queryNewGroupsLastWeeks } from "./repository";
import { queryTopGroupsByTotalCount } from "./repository";
import { queryTodayGroupUsages } from "./repository";
import { queryTodayUserUsages } from "./repository";
import { queryTodayGroups } from "./repository";
import { queryTodayUsers } from "./repository";

export async function instaSummaryBasic() {
    try {
        const rows = await Promise.all([queryTotalUsers, queryTotalGroups, queryTotalUserUsages, queryTotalGroupUsages]);
        const [[usersRow], [groupsRow], [userUsageRow], [groupUsageRow]] = rows;

        const stats = {
            total_users: usersRow?.count ?? 0,
            total_groups: groupsRow?.count ?? 0,
            total_usages: userUsageRow?.total_usages ?? 0,
            total_group_usages: groupUsageRow?.total_group_usages ?? 0,
        };

        return stats;
    } catch (error) {
        console.error(error);
        return { total_users: 0, total_groups: 0, total_usages: 0, total_group_usages: 0 };
    }
}

export async function instaSummaryWithToday() {
    try {
        const [
            [totalUsersRow],
            [totalGroupsRow],
            [todayUsersRow],
            [todayGroupsRow],
            [totalUserUsageRow],
            [totalGroupUsageRow],
            [todayUserUsageRow],
            [todayGroupUsageRow],
        ] = await Promise.all([
            queryTotalUsers,
            queryTotalGroups,
            queryTodayUsers,
            queryTodayGroups,
            queryTotalUserUsages,
            queryTotalGroupUsages,
            queryTodayUserUsages,
            queryTodayGroupUsages,
        ]);

        return {
            users: {
                today: todayUsersRow?.count ?? 0,
                total: totalUsersRow?.count ?? 0,
            },
            groups: {
                today: todayGroupsRow?.count ?? 0,
                total: totalGroupsRow?.count ?? 0,
            },
            usages: {
                today: todayUserUsageRow?.today_usages ?? 0,
                total: totalUserUsageRow?.total_usages ?? 0,
            },
            group_usages: {
                today: todayGroupUsageRow?.today_group_usages ?? 0,
                total: totalGroupUsageRow?.total_group_usages ?? 0,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            users: { today: 0, total: 0 },
            groups: { today: 0, total: 0 },
            usages: { today: 0, total: 0 },
            group_usages: { today: 0, total: 0 },
        };
    }
}

export async function instaNewUsersLastDays(days: number) {
    try {
        type Row = { date: string; count: number };
        const rows: Row[] = await queryNewUsersLastDays(days);

        const countsByDate = new Map<string, number>();
        for (const row of rows) {
            if (!row.date) continue;
            countsByDate.set(row.date, row.count);
        }

        const stats: { date: string; count: number }[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const dateStr = d.toISOString().slice(0, 10);
            const count = countsByDate.get(dateStr) ?? 0;
            stats.push({ date: dateStr, count });
        }

        return stats.reverse();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaNewGroupsLastDays(days: number) {
    try {
        type Row = { date: string; count: number };
        const rows: Row[] = await queryNewGroupsLastDays(days);

        const countsByDate = new Map<string, number>();
        for (const row of rows) {
            if (!row.date) continue;
            countsByDate.set(row.date, row.count);
        }

        const stats: { date: string; count: number }[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const dateStr = d.toISOString().slice(0, 10);
            const count = countsByDate.get(dateStr) ?? 0;
            stats.push({ date: dateStr, count });
        }

        return stats.reverse();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaNewUsersAndGroupsLastDays(days: number) {
    try {
        const [users, groups] = await Promise.all([instaNewUsersLastDays(days), instaNewGroupsLastDays(days)]);
        const usersByDate = new Map<string, number>(users.map((d) => [d.date, d.count]));
        const groupsByDate = new Map<string, number>(groups.map((d) => [d.date, d.count]));

        const dates = new Set<string>([...Array.from(usersByDate.keys()), ...Array.from(groupsByDate.keys())]);

        const stats = Array.from(dates)
            .sort((a, b) => a.localeCompare(b))
            .map((date) => ({
                date: date.split("-").reverse().join("-"),
                users: usersByDate.get(date) ?? 0,
                groups: groupsByDate.get(date) ?? 0,
            }));

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaNewUsersAndGroupsLastWeeks(weeks: number) {
    try {
        type Row = { week: string; count: number };
        const [userRows, groupRows] = await Promise.all([queryNewUsersLastWeeks(weeks), queryNewGroupsLastWeeks(weeks)]);

        const usersByWeek = new Map<string, number>(userRows.map((r: Row) => [r.week, r.count]));
        const groupsByWeek = new Map<string, number>(groupRows.map((r: Row) => [r.week, r.count]));

        const today = new Date();
        const day = today.getDay(); // 0..6, Sunday=0
        const diffToMonday = (day + 6) % 7;
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setHours(0, 0, 0, 0);
        startOfThisWeek.setDate(today.getDate() - diffToMonday);

        const stats: { date: string; users: number; groups: number }[] = [];

        for (let i = weeks - 1; i >= 0; i--) {
            const d = new Date(startOfThisWeek);
            d.setDate(startOfThisWeek.getDate() - i * 7);

            const weekStart = d.toISOString().slice(0, 10); // YYYY-MM-DD (Monday)

            stats.push({
                date: weekStart.split("-").reverse().join("-"), // dd-mm-yyyy
                users: usersByWeek.get(weekStart) ?? 0,
                groups: groupsByWeek.get(weekStart) ?? 0,
            });
        }

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaUsersByStatus() {
    try {
        type Status = "active" | "deleted_account" | "has_blocked" | "other" | null;
        type Row = { status: Status; count: number };

        const rows: Row[] = await queryUsersByStatus;

        const obj = rows.reduce<Record<string, number>>((acc, item) => {
            if (!item.status) return acc;
            acc[item.status] = item.count;
            return acc;
        }, {});

        const stats = [
            { status: "Aktiv", count: obj.active ?? 0 },
            { status: "Boshqa", count: obj.other ?? 0 },
            { status: "O'chirilgan", count: (obj.deleted_account ?? 0) + (obj.has_blocked ?? 0) },
        ];

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaGroupsByStatus() {
    try {
        type Status = "active" | "left" | "kicked" | "other" | null;
        type Row = { status: Status; count: number };

        const rows: Row[] = await queryGroupsByStatus;

        const obj = rows.reduce<Record<string, number>>((acc, item) => {
            if (!item.status) return acc;
            acc[item.status] = item.count;
            return acc;
        }, {});

        return [
            { status: "Aktiv", count: obj.active ?? 0 },
            { status: "Boshqa", count: (obj.other ?? 0) + (obj.kicked ?? 0) },
            { status: "Chiqib ketgan", count: obj.left ?? 0 },
        ];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function instaTopGroups(limit: number) {
    try {
        type Row = { group_name: string | null; total_count: number; today_count: number };
        const rows: Row[] = await queryTopGroupsByTotalCount(limit);

        return rows.map((row) => ({
            group_name: row.group_name ?? "Noma'lum guruh",
            total_count: row.total_count ?? 0,
            today_count: row.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}
