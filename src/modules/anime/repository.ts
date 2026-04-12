import { desc, eq, sql as dsql, and, not } from "drizzle-orm";
import { db, sql as animeSql } from "@/db/anime/client";
import { abu, anime, dub, episode } from "@/db/anime/schema";

const selectCount = { count: dsql<number>`count(*)`.mapWith(Number) };
const selectSumTotalCount = { total_count: dsql<number>`coalesce(sum(${episode.total_count}), 0)`.mapWith(Number) };
const selectSumTodayCount = { today_count: dsql<number>`coalesce(sum(${episode.today_count}), 0)`.mapWith(Number) };

export const queryTotalUsers = db.select(selectCount).from(abu);
export const queryTotalAnimes = db.select(selectCount).from(anime);
export const queryTotalDubs = db.select(selectCount).from(dub);
export const queryTotalEpisodes = db.select(selectCount).from(episode);

export const queryUsersByStatus = db
    .select({ status: abu.status, count: dsql<number>`count(*)`.mapWith(Number) })
    .from(abu)
    .where(dsql`status is not null`)
    .groupBy(abu.status)
    .orderBy(abu.status);

const dayStartTashkentUsers = dsql`date_trunc('day', ${abu.created_at} AT TIME ZONE 'Asia/Tashkent')::date`;
const currentDayStartTashkent = dsql`date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')::date`;

export async function queryTashkentDayStartsIso(days: number): Promise<string[]> {
    const rows = await animeSql<{ d: string }[]>`
        select (date_trunc('day', now() at time zone 'Asia/Tashkent')::date - g)::text as d
        from generate_series(0, ${days - 1}) as g
    `;
    return rows.map((r) => r.d);
}

export function queryTotalUsersBeforeDayStartTashkent(days: number) {
    const oldestOffsetDays = days - 1;
    const oldestDay =
        oldestOffsetDays === 0
            ? currentDayStartTashkent
            : dsql`(date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')::date - (${oldestOffsetDays} * interval '1 day'))`;

    return db
        .select({
            count: dsql<number>`count(*)`.mapWith(Number),
        })
        .from(abu)
        .where(dsql`${dayStartTashkentUsers} < ${oldestDay}`);
}

export function queryNewUsersLastDaysTashkent(days: number) {
    const oldestOffsetDays = days - 1;
    const oldestDay =
        oldestOffsetDays === 0
            ? currentDayStartTashkent
            : dsql`(date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')::date - (${oldestOffsetDays} * interval '1 day'))`;

    return db
        .select({
            day: dsql<string>`${dayStartTashkentUsers}::text`.as("day"),
            count: dsql<number>`count(*)`.mapWith(Number),
        })
        .from(abu)
        .where(dsql`${dayStartTashkentUsers} >= ${oldestDay} and ${dayStartTashkentUsers} <= ${currentDayStartTashkent}`)
        .groupBy(dayStartTashkentUsers)
        .orderBy(desc(dayStartTashkentUsers));
}

export function queryTopDubsByTotalCount(limit: number) {
    return db
        .select({
            dub_name: dsql<string>`coalesce(${dub.name}, ${episode.dub}, 'Noma''lum dub')`.as("dub_name"),
            ...selectSumTotalCount,
            ...selectSumTodayCount,
        })
        .from(episode)
        .leftJoin(dub, eq(dub.id, dsql<number>`${episode.dub}::int`))
        .groupBy(dub.name, episode.dub)
        .orderBy(desc(selectSumTotalCount.total_count))
        .limit(limit);
}

export function queryTopAnimesByTotalCount(limit: number) {
    return db
        .select({
            anime_name: anime.name,
            ...selectSumTotalCount,
            ...selectSumTodayCount,
        })
        .from(episode)
        .innerJoin(anime, eq(episode.anime_id, anime.id))
        .groupBy(anime.id, anime.name)
        .orderBy(desc(selectSumTotalCount.total_count))
        .limit(limit);
}

export function queryTopUsersByTotalCount(limit: number) {
    return db
        .select({
            first_name: abu.first_name,
            last_name: abu.last_name,
            username: abu.username,
            total_count: abu.total_count,
            today_count: abu.today_count,
            status: abu.status,
        })
        .from(abu)
        .where(and(eq(abu.status, "active"), not(eq(abu.username, "najmiddin_nazirov"))))
        .orderBy(desc(abu.total_count))
        .limit(limit);
}
