import { USER_STATUS } from "@/utils/constants/movie";
import {
    queryNewUsersLastDaysTashkent,
    querySumMoviesTotalUses,
    queryTashkentDayStartsIso,
    queryTotalUsersBeforeDayStartTashkent,
    queryTotalActiveUsers,
    queryTotalMovies,
    queryTotalUsers,
    queryTopMoviesByTotalCount,
    queryTopActiveUsersByTotalCount,
    queryLatestMoviesByCreatedAt,
    queryUsersByStatus,
    queryMoviesForStudioStats,
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
        const rows = await Promise.all([queryTotalMovies, querySumMoviesTotalUses, queryTotalUsers, queryTotalActiveUsers]);
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

export async function movieDailyTotalUsers(days: number): Promise<{ date: string; users: number }[]> {
    try {
        const [baselineRows, daily] = await Promise.all([queryTotalUsersBeforeDayStartTashkent(days), movieDailyNewUsers(days)]);
        const baseline = baselineRows?.[0]?.count ?? 0;

        let running = baseline;
        return daily.map((d) => {
            running += d.users ?? 0;
            return { date: d.date, users: running };
        });
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

export type MovieTopItem = {
    code: string;
    posts: string;
    description: string | null;
    total_count: number;
    today_count: number;
};

export async function movieTopMovies(limit: number): Promise<MovieTopItem[]> {
    try {
        type Row = {
            code: string;
            posts: string;
            description: string | null;
            total_count: number | null;
            today_count: number | null;
        };

        const rows: Row[] = await queryTopMoviesByTotalCount(limit);

        return rows.map((r) => ({
            code: r.code,
            posts: r.posts,
            description: r.description ?? null,
            total_count: r.total_count ?? 0,
            today_count: r.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export type MovieTopStudioItem = {
    studio: string;
    total_count: number;
    movies_count: number;
};

function extractStudiosFromDescription(description: string): string[] {
    const idx = description.indexOf("🎞 Studiya:");
    if (idx === -1) return [];

    const after = description.slice(idx);
    const line = after.split(/\r?\n/, 1)[0] ?? "";

    const tags = line.match(/#[^\s#]+/g) ?? [];
    const unique = new Set(tags.map((t) => t.trim()).filter(Boolean));
    return Array.from(unique);
}

export async function movieTopStudios(limit: number): Promise<MovieTopStudioItem[]> {
    try {
        type Row = { description: string | null; total_count: number | null };
        const rows: Row[] = await queryMoviesForStudioStats();

        const agg = new Map<string, { total_count: number; movies: Set<number> }>();

        rows.forEach((r, i) => {
            const desc = r.description ?? "";
            const studios = extractStudiosFromDescription(desc);
            if (studios.length === 0) return;

            const movieTotal = r.total_count ?? 0;
            for (const studio of studios) {
                const current = agg.get(studio) ?? { total_count: 0, movies: new Set<number>() };
                current.total_count += movieTotal;
                current.movies.add(i);
                agg.set(studio, current);
            }
        });

        return Array.from(agg.entries())
            .map(([studio, v]) => ({ studio, total_count: v.total_count, movies_count: v.movies.size }))
            .sort((a, b) => b.total_count - a.total_count)
            .slice(0, limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export type MovieTopGenreItem = {
    genre: string;
    total_count: number;
    movies_count: number;
};

function extractGenresFromDescription(description: string): string[] {
    const idx = description.indexOf("🎬 Janr:");
    if (idx === -1) return [];

    const after = description.slice(idx);
    const line = after.split(/\r?\n/, 1)[0] ?? "";

    const tags = line.match(/#[^\s#]+/g) ?? [];
    const unique = new Set(tags.map((t) => t.trim()).filter(Boolean));
    return Array.from(unique);
}

export async function movieTopGenres(limit: number): Promise<MovieTopGenreItem[]> {
    try {
        type Row = { description: string | null; total_count: number | null };
        const rows: Row[] = await queryMoviesForStudioStats();

        const agg = new Map<string, { total_count: number; movies: Set<number> }>();

        rows.forEach((r, i) => {
            const desc = r.description ?? "";
            const genres = extractGenresFromDescription(desc);
            if (genres.length === 0) return;

            const movieTotal = r.total_count ?? 0;
            for (const genre of genres) {
                const current = agg.get(genre) ?? { total_count: 0, movies: new Set<number>() };
                current.total_count += movieTotal;
                current.movies.add(i);
                agg.set(genre, current);
            }
        });

        return Array.from(agg.entries())
            .map(([genre, v]) => ({ genre, total_count: v.total_count, movies_count: v.movies.size }))
            .sort((a, b) => b.total_count - a.total_count)
            .slice(0, limit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export type MovieTopUserItem = {
    user_name: string;
    total_count: number;
    today_count: number;
};

export async function movieTopActiveUsers(limit: number): Promise<MovieTopUserItem[]> {
    try {
        type Row = {
            tg_id: string;
            first_name: string | null;
            last_name: string | null;
            username: string | null;
            total_count: number | null;
            today_count: number | null;
        };

        const rows: Row[] = await queryTopActiveUsersByTotalCount(limit);

        return rows.map((r) => ({
            user_name: (r.first_name || "") + " " + (r.last_name || ""),
            total_count: r.total_count ?? 0,
            today_count: r.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export type MovieLatestItem = {
    code: string;
    posts: string;
    description: string | null;
    total_count: number;
    today_count: number;
    created_at: string;
};

export async function movieLatestMovies(limit: number): Promise<MovieLatestItem[]> {
    try {
        type Row = {
            code: string;
            posts: string;
            description: string | null;
            total_count: number | null;
            today_count: number | null;
            created_at: Date | string | null;
        };

        const rows: Row[] = await queryLatestMoviesByCreatedAt(limit);

        return rows.map((r) => ({
            code: r.code,
            posts: r.posts,
            description: r.description ?? null,
            total_count: r.total_count ?? 0,
            today_count: r.today_count ?? 0,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date(0).toISOString(),
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}
