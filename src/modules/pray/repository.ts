import { isNotNull } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { and } from "drizzle-orm";
import { gt } from "drizzle-orm";
import { ptu } from "@/db/schema";
import { pt } from "@/db/schema";
import { db } from "@/db/client";

// --- Conditions  ---
const conditionTimeNull = isNull(ptu.time);
const conditionCityNull = isNull(ptu.city);
const conditionCityNotNull = isNotNull(ptu.city);
const conditionLanguageNull = isNull(ptu.language);
const conditionLanguageNotNull = isNotNull(ptu.language);
const conditionTimeNotNullAndActive = and(isNotNull(ptu.time), eq(ptu.is_active, true));
const conditionTimeNotNullAndInactive = and(isNotNull(ptu.time), eq(ptu.is_active, false));
const conditionTimeNullAndActive = and(conditionTimeNull, eq(ptu.is_active, true));
const conditionTimeNullAndInactive = and(conditionTimeNull, eq(ptu.is_active, false));
const conditionActiveUser = and(isNotNull(ptu.time), isNotNull(ptu.language), isNotNull(ptu.city), eq(ptu.is_active, true));
const conditionUpdatedLast5Days = gt(ptu.updated_at, sql`now() - interval '5 days'`);

// --- Select ---
const selectDateUz = { date: pt.date_text_uz };
const selectCount = { count: sql<number>`count(*)`.mapWith(Number) };
const selectTimeWithCount = { time: ptu.time, count: sql<number>`count(*)`.mapWith(Number) };
const selectCityWithCount = { city: ptu.city, count: sql<number>`count(*)`.mapWith(Number) };
const selectDistinctCityCount = { count: sql<number>`count(distinct ${ptu.city})`.mapWith(Number) };
const selectLanguageWithCount = { language: ptu.language, count: sql<number>`count(*)`.mapWith(Number) };
const selectPtCityAndTimes = { city: pt.city, tong: pt.tong, quyosh: pt.quyosh, peshin: pt.peshin, asr: pt.asr, shom: pt.shom, xufton: pt.xufton };
const selectUpdatedDateWithCount = { date: sql<string>`date(${ptu.updated_at})`.as("date"), count: sql<number>`count(*)`.mapWith(Number) };

// --- OrderBy ---
const orderByTimeAsc = ptu.time;
const orderByLanguageAsc = ptu.language;
const orderByCountDesc = sql`count(*) desc`;
const orderByIdDesc = desc(ptu.id);
const orderByUpdatedDate = sql`date(${ptu.updated_at})`;

// --- Queries  ---
export const queryCountCityNull = db.select(selectCount).from(ptu).where(conditionCityNull);
export const queryCountTimeNull = db.select(selectCount).from(ptu).where(conditionTimeNull);
export const queryCountLanguageNull = db.select(selectCount).from(ptu).where(conditionLanguageNull);
export const queryCountTimeNotNullAndActive = db.select(selectCount).from(ptu).where(conditionTimeNotNullAndActive);
export const queryCountTimeNotNullAndInactive = db.select(selectCount).from(ptu).where(conditionTimeNotNullAndInactive);
export const queryCountTimeNullAndActive = db.select(selectCount).from(ptu).where(conditionTimeNullAndActive);
export const queryCountTimeNullAndInactive = db.select(selectCount).from(ptu).where(conditionTimeNullAndInactive);
export const queryActiveUsersCountByTime = db.select(selectTimeWithCount).from(ptu).where(conditionActiveUser).groupBy(ptu.time).orderBy(orderByTimeAsc);
export const queryDistinctCityCountActiveUsers = db.select(selectDistinctCityCount).from(ptu).where(conditionActiveUser);
export const queryActiveUsersOrderByIdDesc = db.select().from(ptu).where(conditionActiveUser).orderBy(orderByIdDesc);
export const queryUsersOrderByIdDesc = db.select().from(ptu).orderBy(orderByIdDesc);
export const queryCountActiveUsers = db.select(selectCount).from(ptu).where(conditionActiveUser);
export const queryPtCityAndTimes = db.select(selectPtCityAndTimes).from(pt);
export const queryCountAllUsers = db.select(selectCount).from(ptu);
export const queryAnyActiveCityDateUz = db
    .select(selectDateUz)
    .from(pt)
    .innerJoin(ptu, and(eq(pt.city, ptu.city), conditionActiveUser))
    .limit(1);
export const queryAllUsersByLanguage = db
    .select(selectLanguageWithCount)
    .from(ptu)
    .where(conditionLanguageNotNull)
    .groupBy(ptu.language)
    .orderBy(orderByLanguageAsc);
export const queryActiveUsersByLanguage = db
    .select(selectLanguageWithCount)
    .from(ptu)
    .where(conditionActiveUser)
    .groupBy(ptu.language)
    .orderBy(orderByLanguageAsc);
export const queryCityWithCountOrderByCountDesc = db
    .select(selectCityWithCount)
    .from(ptu)
    .where(conditionCityNotNull)
    .groupBy(ptu.city)
    .orderBy(orderByCountDesc);
export const queryUpdatedUsersLast5Days = db
    .select(selectUpdatedDateWithCount)
    .from(ptu)
    .where(conditionUpdatedLast5Days)
    .groupBy(sql`date(${ptu.updated_at})`)
    .orderBy(orderByUpdatedDate);
