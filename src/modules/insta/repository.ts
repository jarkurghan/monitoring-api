import { desc, eq, sql } from "drizzle-orm";
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

export async function queryCumulativeUsersGroupsBeforeMondaysTashkent(weeks: number): Promise<{ week: string; users: number; groups: number }[]> {
    const rows = await instaSql<{ week: string; users: number; groups: number }[]>`
        with mondays as (
            select (date_trunc('week', now() at time zone 'Asia/Tashkent')::date - (g * 7))::date as monday
            from generate_series(0, ${weeks - 1}) as g
        )
        select
            mondays.monday::text as week,
            (select count(*)::int from insta_saver_users u where (u.created_at at time zone 'Asia/Tashkent') < mondays.monday) as users,
            (select count(*)::int from insta_saver_groups g where (g.created_at at time zone 'Asia/Tashkent') < mondays.monday) as groups
        from mondays
        order by mondays.monday desc
    `;
    return rows.map((r) => ({ week: r.week, users: Number(r.users ?? 0), groups: Number(r.groups ?? 0) }));
}
