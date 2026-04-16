import { desc, eq, sql as dsql } from "drizzle-orm";
import { db, sql as movieSql } from "@/db/movie/client";
import { mbu, movie } from "@/db/movie/schema";

const dayStartTashkentUsers = dsql`date_trunc('day', ${mbu.created_at} AT TIME ZONE 'Asia/Tashkent')::date`;
const currentDayStartTashkent = dsql`date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')::date`;

export async function queryTashkentDayStartsIso(days: number): Promise<string[]> {
    const rows = await movieSql<{ d: string }[]>`
        select (date_trunc('day', now() at time zone 'Asia/Tashkent')::date - g)::text as d
        from generate_series(0, ${days - 1}) as g
    `;
    return rows.map((r) => r.d);
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
        .from(mbu)
        .where(dsql`${dayStartTashkentUsers} >= ${oldestDay} and ${dayStartTashkentUsers} <= ${currentDayStartTashkent}`)
        .groupBy(dayStartTashkentUsers)
        .orderBy(desc(dayStartTashkentUsers));
}

const selectCount = { count: dsql<number>`count(*)`.mapWith(Number) };
const selectSumMovieTotalCount = {
    total_uses: dsql<number>`coalesce(sum(${movie.total_count}), 0)`.mapWith(Number),
};

export const queryTotalMovies = db.select(selectCount).from(movie);
export const querySumMoviesTotalUses = db.select(selectSumMovieTotalCount).from(movie);
export const queryTotalUsers = db.select(selectCount).from(mbu);
export const queryTotalActiveUsers = db.select(selectCount).from(mbu).where(eq(mbu.status, "active"));

export const queryUsersByStatus = db
    .select({ status: mbu.status, count: dsql<number>`count(*)`.mapWith(Number) })
    .from(mbu)
    .where(dsql`status is not null`)
    .groupBy(mbu.status)
    .orderBy(mbu.status);
