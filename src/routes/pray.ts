import { Hono } from "hono";
import { getLatestUsers } from "@/modules/pray/controller";
import { getActivePerTimes } from "@/modules/pray/controller";
import { getActiveUsersAndCities } from "@/modules/pray/controller";
import { getUpdatedUsersLast5Days } from "@/modules/pray/controller";
import { getCityCountsWithRegion } from "@/modules/pray/controller";
import { getMinMaxPrayerTimes } from "@/modules/pray/controller";
import { getPerLanguage } from "@/modules/pray/controller";
import { getCountNulls } from "@/modules/pray/controller";
import { getUserStatus } from "@/modules/pray/controller";
import { getCityCount } from "@/modules/pray/controller";

const pray = new Hono();

pray.get("/stat/active-per-times", getActivePerTimes);
pray.get("/stat/latest-users", getLatestUsers);
pray.get("/stat/updated-users-last-5-days", getUpdatedUsersLast5Days);
pray.get("/stat/user-status", getUserStatus);
pray.get("/stat/active-users-and-cities", getActiveUsersAndCities);

// ------------------------------------------------------- //

pray.get("/stat/per-language", getPerLanguage);
pray.get("/stat/count-nulls", getCountNulls);
pray.get("/stat/city-count", getCityCount);
pray.get("/stat/city-count-with-region", getCityCountsWithRegion);
pray.get("/stat/min-max-prayer-times", getMinMaxPrayerTimes);

export default pray;
