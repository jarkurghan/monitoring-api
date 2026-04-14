import { queryTotalUsers } from "./repository";
import { queryTotalAnimes } from "./repository";
import { queryTotalDubs } from "./repository";
import { queryTotalEpisodes } from "./repository";
import { queryTopAnimesByTotalCount } from "./repository";
import { queryTopDubsByTotalCount } from "./repository";
import { queryTopUsersByTotalCount } from "./repository";
import { queryUsersByStatus } from "./repository";
import { queryNewUsersLastDaysTashkent } from "./repository";
import { queryTashkentDayStartsIso } from "./repository";
import { queryTotalUsersBeforeDayStartTashkent } from "./repository";
import { queryLatestAnimesByEpisodeCreatedAt } from "./repository";

export async function animeSummaryBasic() {
    try {
        const rows = await Promise.all([queryTotalUsers, queryTotalAnimes, queryTotalDubs, queryTotalEpisodes]);
        const [[usersRow], [animesRow], [dubsRow], [episodesRow]] = rows;

        const stats = {
            total_users: usersRow?.count ?? 0,
            total_animes: animesRow?.count ?? 0,
            total_dubs: dubsRow?.count ?? 0,
            total_episodes: episodesRow?.count ?? 0,
        };

        return stats;
    } catch (error) {
        console.error(error);
        return { total_users: 0, total_animes: 0, total_dubs: 0, total_episodes: 0 };
    }
}

export async function animeTopDubs(limit: number) {
    try {
        type Row = { dub_name: string; total_count: number; today_count: number };
        const rows: Row[] = await queryTopDubsByTotalCount(limit);
        return rows.map((r) => ({
            dub_name: r.dub_name ?? "Noma'lum dub",
            total_count: r.total_count ?? 0,
            today_count: r.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function animeTopAnimes(limit: number) {
    try {
        type Row = { anime_name: string; total_count: number; today_count: number };
        const rows: Row[] = await queryTopAnimesByTotalCount(limit);
        return rows.map((r) => ({
            anime_name: r.anime_name ?? "Noma'lum anime",
            total_count: r.total_count ?? 0,
            today_count: r.today_count ?? 0,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function animeTopUsers(limit: number) {
    try {
        type Row = {
            first_name: string | null;
            last_name: string | null;
            username: string | null;
            total_count: number;
            today_count: number;
        };
        const rows: Row[] = await queryTopUsersByTotalCount(limit);
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

export async function animeUsersByStatus() {
    try {
        type Status = "active" | "inactive" | "deleted_account" | "has_blocked" | "other" | null;
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
            { status: "O'chirilgan", count: (obj.deleted_account ?? 0) + (obj.inactive ?? 0) + (obj.has_blocked ?? 0) },
        ];

        return stats;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function animeDailyNewUsers(days: number) {
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

export async function animeDailyTotalUsers(days: number) {
    try {
        const [baselineRows, daily] = await Promise.all([queryTotalUsersBeforeDayStartTashkent(days), animeDailyNewUsers(days)]);
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

export async function animeLatestAnimes(limit: number) {
    try {
        type Row = {
            anime_name: string | null;
            number_of_episode: number | null;
            episode_count: number;
            dub_name: string | null;
            created_date: string | Date | null;
        };

        const rows: Row[] = await queryLatestAnimesByEpisodeCreatedAt(limit);

        return rows.map((r) => ({
            anime_name: r.anime_name ?? "Noma'lum anime",
            number_of_episode: r.number_of_episode ?? 0,
            episode_count: r.episode_count ?? 0,
            dub_name: r.dub_name ?? "Noma'lum dub",
            created_date: r.created_date,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}
