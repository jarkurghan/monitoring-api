import { isNotNull } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { and } from "drizzle-orm";
import { gt } from "drizzle-orm";
import { ptu } from "@/db/pray/schema";
import { pt } from "@/db/pray/schema";
import { db } from "@/db/pray/client";

// --- Conditions  ---
const conditionCityNull = isNull(ptu.city);
const conditionCityNotNull = isNotNull(ptu.city);
const conditionLanguageNull = isNull(ptu.language);
const conditionLanguageNotNull = isNotNull(ptu.language);
const conditionActiveUser2 = eq(ptu.status, "active");

// --- Select ---
const selectDateUz = { date: pt.date_text_uz };
const selectCount = { count: sql<number>`count(*)`.mapWith(Number) };
const selectStatusWithCount = { status: ptu.status, count: sql<number>`count(*)`.mapWith(Number) };
const selectTimeWithCount = { time: ptu.time, count: sql<number>`count(*)`.mapWith(Number) };
const selectCityWithCount = { city: ptu.city, count: sql<number>`count(*)`.mapWith(Number) };
const selectDistinctCityCount = { count: sql<number>`count(distinct ${ptu.city})`.mapWith(Number) };
const selectLanguageWithCount = { language: ptu.language, count: sql<number>`count(*)`.mapWith(Number) };
const selectPtCityAndTimes = { city: pt.city, tong: pt.tong, quyosh: pt.quyosh, peshin: pt.peshin, asr: pt.asr, shom: pt.shom, xufton: pt.xufton };
const selectUpdatedDateWithCount = { date: sql<string>`date(${ptu.updated_at})`.as("date"), count: sql<number>`count(*)`.mapWith(Number) };
const selectCreatedDateWithCount = { date: sql<string>`date(${ptu.created_at})`.as("date"), count: sql<number>`count(*)`.mapWith(Number) };

// --- OrderBy ---
const orderByTimeAsc = ptu.time;
const orderByStatusAsc = ptu.status;
const orderByLanguageAsc = ptu.language;
const orderByCountDesc = sql`count(*) desc`;
const orderByIdDesc = desc(ptu.id);
const orderByUpdatedDate = sql`date(${ptu.updated_at})`;

// --- Queries  ---
export const queryCountCityNull = db.select(selectCount).from(ptu).where(conditionCityNull);
export const queryCountLanguageNull = db.select(selectCount).from(ptu).where(conditionLanguageNull);
export const queryCountUsersByStatus = db.select(selectStatusWithCount).from(ptu).groupBy(ptu.status).orderBy(orderByStatusAsc);
export const queryActiveUsersCountByTime = db.select(selectTimeWithCount).from(ptu).where(conditionActiveUser2).groupBy(ptu.time).orderBy(orderByTimeAsc);
export const queryDistinctCityCountActiveUsers = db.select(selectDistinctCityCount).from(ptu).where(conditionActiveUser2);
export const queryUsersOrderByIdDesc = db.select().from(ptu).orderBy(orderByIdDesc);
export const queryCountActiveUsers = db.select(selectCount).from(ptu).where(conditionActiveUser2);
export const queryPtCityAndTimes = db.select(selectPtCityAndTimes).from(pt);
export const queryCountAllUsers = db.select(selectCount).from(ptu);
export const queryAnyActiveCityDateUz = db
    .select(selectDateUz)
    .from(pt)
    .innerJoin(ptu, and(eq(pt.city, ptu.city), conditionActiveUser2))
    .limit(1);
export const queryAllUsersByLanguage = db
    .select(selectLanguageWithCount)
    .from(ptu)
    .where(conditionLanguageNotNull)
    .groupBy(ptu.language)
    .orderBy(orderByLanguageAsc);
export const queryCityWithCountOrderByCountDesc = db
    .select(selectCityWithCount)
    .from(ptu)
    .where(conditionCityNotNull)
    .groupBy(ptu.city)
    .orderBy(orderByCountDesc);
export function queryUpdatedUsersLastDays(days: number) {
    return db
        .select(selectUpdatedDateWithCount)
        .from(ptu)
        .where(gt(ptu.updated_at, sql`now() - make_interval(days => ${days})`))
        .groupBy(sql`date(${ptu.updated_at})`)
        .orderBy(orderByUpdatedDate);
}

export function queryCreatedUsersLastDays(days: number) {
    return db
        .select(selectCreatedDateWithCount)
        .from(ptu)
        .where(gt(ptu.created_at, sql`now() - make_interval(days => ${days})`))
        .groupBy(sql`date(${ptu.created_at})`)
        .orderBy(sql`date(${ptu.created_at})`);
}

export function queryTotalUsersBeforeCreatedDayStart(days: number) {
    return db
        .select(selectCount)
        .from(ptu)
        .where(sql`date(${ptu.created_at}) < date(now() - make_interval(days => ${days - 1}))`);
}
