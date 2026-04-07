import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db, sql as instaSql } from "@/db/insta/client";
import { isg, isu } from "@/db/insta/schema";

const selectCount = { count: sql<number>`count(*)`.mapWith(Number) };
const selectSumTotalUserUsages = { total_usages: sql<number>`coalesce(sum(${isu.total_count}), 0)`.mapWith(Number) };
const selectSumTotalGroupUsages = { total_group_usages: sql<number>`coalesce(sum(${isg.total_count}), 0)`.mapWith(Number) };

const selectUserStatusWithCount = { status: isu.status, count: sql<number>`count(*)`.mapWith(Number) };
const selectGroupStatusWithCount = { status: isg.status, count: sql<number>`count(*)`.mapWith(Number) };
const selectGroupWithTotalCount = { global_name: isg.global_name, total_count: isg.total_count, today_count: isg.today_count };

export const queryTotalUsers = db.select(selectCount).from(isu);
export const queryTotalGroups = db.select(selectCount).from(isg);

export const queryTotalUserUsages = db.select(selectSumTotalUserUsages).from(isu);

export const queryTotalGroupUsages = db.select(selectSumTotalGroupUsages).from(isg);

export function queryTopGroupsByTotalCount(limit: number) {
    return db.select(selectGroupWithTotalCount).from(isg).orderBy(desc(isg.total_count)).where(eq(isg.is_global, true)).limit(limit);
}

export const queryUsersByStatus = db
    .select(selectUserStatusWithCount)
    .from(isu)
    .where(sql`status is not null`)
    .groupBy(isu.status)
    .orderBy(isu.status);

export const queryGroupsByStatus = db
    .select(selectGroupStatusWithCount)
    .from(isg)
    .where(sql`status is not null`)
    .groupBy(isg.status)
    .orderBy(isg.status);

const weekStartTashkentUsers = sql`date_trunc('week', ${isu.created_at} AT TIME ZONE 'Asia/Tashkent')::date`;
const weekStartTashkentGroups = sql`date_trunc('week', ${isg.created_at} AT TIME ZONE 'Asia/Tashkent')::date`;
const currentWeekStartTashkent = sql`date_trunc('week', now() AT TIME ZONE 'Asia/Tashkent')::date`;

export async function queryTashkentWeekMondaysIso(n: number): Promise<string[]> {
    const rows = await instaSql<{ d: string }[]>`
        select (date_trunc('week', now() at time zone 'Asia/Tashkent')::date - (g * 7))::text as d
        from generate_series(0, ${n - 1}) as g
    `;
    return rows.map((r) => r.d);
}

export function queryNewUsersLastWeeksTashkent(weeks: number) {
    const oldestOffsetDays = (weeks - 1) * 7;
    const oldestMonday =
        oldestOffsetDays === 0
            ? currentWeekStartTashkent
            : sql`(date_trunc('week', now() AT TIME ZONE 'Asia/Tashkent')::date - (${oldestOffsetDays} * interval '1 day'))`;
    return db
        .select({
            week: sql<string>`${weekStartTashkentUsers}::text`.as("week"),
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(isu)
        .where(and(gte(weekStartTashkentUsers, oldestMonday), lte(weekStartTashkentUsers, currentWeekStartTashkent)))
        .groupBy(weekStartTashkentUsers)
        .orderBy(desc(weekStartTashkentUsers));
}

export function queryNewGroupsLastWeeksTashkent(weeks: number) {
    const oldestOffsetDays = (weeks - 1) * 7;
    const oldestMonday =
        oldestOffsetDays === 0
            ? currentWeekStartTashkent
            : sql`(date_trunc('week', now() AT TIME ZONE 'Asia/Tashkent')::date - (${oldestOffsetDays} * interval '1 day'))`;
    return db
        .select({
            week: sql<string>`${weekStartTashkentGroups}::text`.as("week"),
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(isg)
        .where(and(gte(weekStartTashkentGroups, oldestMonday), lte(weekStartTashkentGroups, currentWeekStartTashkent)))
        .groupBy(weekStartTashkentGroups)
        .orderBy(desc(weekStartTashkentGroups));
}
