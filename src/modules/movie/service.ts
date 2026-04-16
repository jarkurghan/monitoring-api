import { USER_STATUS } from "@/utils/constants/movie";
import {
    queryNewUsersLastDaysTashkent,
    querySumMoviesTotalUses,
    queryTashkentDayStartsIso,
    queryTotalActiveUsers,
    queryTotalMovies,
    queryTotalUsers,
    queryUsersByStatus,
} from "./repository";

export type MovieSummaryBasic = {
    total_movies: number;
    total_uses: number;
    total_users: number;
    total_active_users: number;
};

const emptySummary: MovieSummaryBasic = {
    total_movies: 0,
    total_uses: 0,
    total_users: 0,
    total_active_users: 0,
};

export async function movieSummaryBasic(): Promise<MovieSummaryBasic> {
    try {
        const rows = await Promise.all([
            queryTotalMovies,
            querySumMoviesTotalUses,
            queryTotalUsers,
            queryTotalActiveUsers,
        ]);
        const [[moviesRow], [usesRow], [usersRow], [activeRow]] = rows;

        return {
            total_movies: moviesRow?.count ?? 0,
            total_uses: usesRow?.total_uses ?? 0,
            total_users: usersRow?.count ?? 0,
            total_active_users: activeRow?.count ?? 0,
        };
    } catch (error) {
        console.error(error);
        return { ...emptySummary };
    }
}

export async function movieDailyNewUsers(days: number) {
    try {
        const [daysIso, rows] = await Promise.all([queryTashkentDayStartsIso(days), queryNewUsersLastDaysTashkent(days)]);

        if (daysIso.length === 0) return [];

        const byDay = new Map(rows.map((r) => [r.day, r.count]));

        const stats: { date: string; users: number }[] = [];
        for (const iso of daysIso) {
            stats.push({ date: iso.split("-").reverse().join("-"), users: byDay.get(iso) ?? 0 });
        }

        return stats.reverse();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function movieUsersByStatus() {
    try {
        type Status = (typeof USER_STATUS)[number] | null;
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
