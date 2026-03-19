import { Hono } from "hono";
import { getLatestUsers } from "@/modules/pray/controller";
import { getActivePerTimes } from "@/modules/pray/controller";
import { getActiveUsersAndCities } from "@/modules/pray/controller";
import { getUpdatedUsersLastDays } from "@/modules/pray/controller";
import { getCityCountsWithRegion } from "@/modules/pray/controller";
import { getCityCountsByRegionName } from "@/modules/pray/controller";
import { getUserStatus } from "@/modules/pray/controller";

const pray = new Hono();

pray.get("/stat/user-status", getUserStatus);
pray.get("/stat/latest-users", getLatestUsers);
pray.get("/stat/active-per-times", getActivePerTimes);
pray.get("/stat/active-users-and-cities", getActiveUsersAndCities);
pray.get("/stat/city-count-with-region", getCityCountsWithRegion);
pray.get("/stat/city-count-with-region/:region", getCityCountsByRegionName);
pray.get("/stat/updated-users-last-days/:days", getUpdatedUsersLastDays);

export default pray;
