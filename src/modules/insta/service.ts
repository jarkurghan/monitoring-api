import { queryTotalUsers } from "./repository";
import { queryTotalGroups } from "./repository";
import { queryUsersByStatus } from "./repository";
import { queryGroupsByStatus } from "./repository";
import { queryTotalUserUsages } from "./repository";
import { queryTotalGroupUsages } from "./repository";
import { queryTopGroupsByTotalCount } from "./repository";
import { queryCumulativeUsersGroupsBeforeMondaysTashkent } from "./repository";

export async function instaSummaryBasic() {
    try {
        const rows = await Promise.all([queryTotalUsers, queryTotalGroups, queryTotalUserUsages, queryTotalGroupUsages]);
        const [[usersRow], [groupsRow], [userUsageRow], [groupUsageRow]] = rows;

        const stats = {
            total_users: usersRow?.count ?? 0,
            total_groups: groupsRow?.count ?? 0,
            total_usages: (userUsageRow?.total_usages ?? 0) + (groupUsageRow?.total_group_usages ?? 0),
            total_group_usages: groupUsageRow?.total_group_usages ?? 0,
        };

        return stats;
    } catch (error) {
        console.error(error);
        return { total_users: 0, total_groups: 0, total_usages: 0, total_group_usages: 0 };
    }
}

export async function instaWeeklyCumulativeBeforeMondayTashkent(n: number) {
    try {
        const rows = await queryCumulativeUsersGroupsBeforeMondaysTashkent(n);
        if (rows.length === 0) return [];

        const stats: { date: string; users: number; groups: number }[] = rows.map((r) => ({
            date: r.week.split("-").reverse().join("-"),
            users: r.users ?? 0,
            groups: r.groups ?? 0,
        }));

        return stats.reverse();
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
            { status: "Boshqa", count: (obj.deleted_account ?? 0) + (obj.other ?? 0) },
            { status: "O'chirilgan", count: obj.has_blocked ?? 0 },
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
        type Row = { global_name: string | null; total_count: number; today_count: number };
        const rows: Row[] = await queryTopGroupsByTotalCount(limit);

        return rows.map((row) => ({
            group_name: row.global_name ?? "Noma'lum guruh",
            total_count: row.total_count ?? 0,
            today_count: row.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}
