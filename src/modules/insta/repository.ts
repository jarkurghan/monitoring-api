import { and, desc, gt, gte, lt, sql } from "drizzle-orm";
import { isg, isu } from "@/db/insta/schema";
import { db } from "@/db/insta/client";

const selectCount = { count: sql<number>`count(*)`.mapWith(Number) };
const selectSumTotalUserUsages = { total_usages: sql<number>`coalesce(sum(${isu.total_count}), 0)`.mapWith(Number) };
const selectSumTodayUserUsages = { today_usages: sql<number>`coalesce(sum(${isu.today_count}), 0)`.mapWith(Number) };
const selectSumTotalGroupUsages = { total_group_usages: sql<number>`coalesce(sum(${isg.total_count}), 0)`.mapWith(Number) };
const selectSumTodayGroupUsages = { today_group_usages: sql<number>`coalesce(sum(${isg.today_count}), 0)`.mapWith(Number) };

const selectUserStatusWithCount = { status: isu.status, count: sql<number>`count(*)`.mapWith(Number) };
const selectGroupStatusWithCount = { status: isg.status, count: sql<number>`count(*)`.mapWith(Number) };
const selectGroupWithTotalCount = { group_name: isg.chat_name, total_count: isg.total_count, today_count: isg.today_count };
const selectCreatedDateWithCount = { date: sql<string>`date(${isu.created_at})`.as("date"), count: sql<number>`count(*)`.mapWith(Number) };
const selectGroupCreatedDateWithCount = { date: sql<string>`date(${isg.created_at})`.as("date"), count: sql<number>`count(*)`.mapWith(Number) };
const selectUserCreatedWeekWithCount = {
    week: sql<string>`date_trunc('week', ${isu.created_at})::date`.as("week"),
    count: sql<number>`count(*)`.mapWith(Number),
};
const selectGroupCreatedWeekWithCount = {
    week: sql<string>`date_trunc('week', ${isg.created_at})::date`.as("week"),
    count: sql<number>`count(*)`.mapWith(Number),
};

const conditionUserTodayHasUsage = gt(isu.today_count, 0);
const conditionGroupTodayHasUsage = gt(isg.today_count, 0);

export const queryTotalUsers = db.select(selectCount).from(isu);
export const queryTotalGroups = db.select(selectCount).from(isg);

export const queryTodayUsers = db.select(selectCount).from(isu).where(conditionUserTodayHasUsage);
export const queryTodayGroups = db.select(selectCount).from(isg).where(conditionGroupTodayHasUsage);

export const queryTotalUserUsages = db.select(selectSumTotalUserUsages).from(isu);
export const queryTodayUserUsages = db.select(selectSumTodayUserUsages).from(isu);

export const queryTotalGroupUsages = db.select(selectSumTotalGroupUsages).from(isg);
export const queryTodayGroupUsages = db.select(selectSumTodayGroupUsages).from(isg);

export function queryTopGroupsByTotalCount(limit: number) {
    return db.select(selectGroupWithTotalCount).from(isg).orderBy(desc(isg.total_count)).limit(limit);
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

export function queryNewUsersLastDays(days: number) {
    return db
        .select(selectCreatedDateWithCount)
        .from(isu)
        .where(gt(isu.created_at, sql`now() - make_interval(days => ${days})`))
        .groupBy(sql`date(${isu.created_at})`)
        .orderBy(sql`date(${isu.created_at})`);
}

export function queryNewGroupsLastDays(days: number) {
    return db
        .select(selectGroupCreatedDateWithCount)
        .from(isg)
        .where(gt(isg.created_at, sql`now() - make_interval(days => ${days})`))
        .groupBy(sql`date(${isg.created_at})`)
        .orderBy(sql`date(${isg.created_at})`);
}

export function queryNewUsersLastWeeks(weeks: number) {
    const fromWeeks = Math.max(weeks - 1, 0);
    return db
        .select(selectUserCreatedWeekWithCount)
        .from(isu)
        .where(
            and(
                gte(isu.created_at, sql`date_trunc('week', now()) - make_interval(weeks => ${fromWeeks})`),
                lt(isu.created_at, sql`date_trunc('week', now()) + make_interval(weeks => 1)`),
            ),
        )
        .groupBy(sql`date_trunc('week', ${isu.created_at})::date`)
        .orderBy(sql`date_trunc('week', ${isu.created_at})::date`);
}

export function queryNewGroupsLastWeeks(weeks: number) {
    const fromWeeks = Math.max(weeks - 1, 0);
    return db
        .select(selectGroupCreatedWeekWithCount)
        .from(isg)
        .where(
            and(
                gte(isg.created_at, sql`date_trunc('week', now()) - make_interval(weeks => ${fromWeeks})`),
                lt(isg.created_at, sql`date_trunc('week', now()) + make_interval(weeks => 1)`),
            ),
        )
        .groupBy(sql`date_trunc('week', ${isg.created_at})::date`)
        .orderBy(sql`date_trunc('week', ${isg.created_at})::date`);
}
