import { getInstaSummaryBasic } from "@/modules/insta/controller";
import { getInstaNewUsersLastDays } from "@/modules/insta/controller";
import { getInstaNewGroupsLastDays } from "@/modules/insta/controller";
import { getInstaNewUsersAndGroupsLastDays } from "@/modules/insta/controller";
import { getInstaNewUsersAndGroupsLastWeeks } from "@/modules/insta/controller";
import { getInstaSummaryWithToday } from "@/modules/insta/controller";
import { getInstaUsersByStatus } from "@/modules/insta/controller";
import { getInstaGroupsByStatus } from "@/modules/insta/controller";
import { getInstaTopGroups } from "@/modules/insta/controller";
import { Hono } from "hono";

const insta = new Hono();

insta.get("/stat/summary-basic", getInstaSummaryBasic);
insta.get("/stat/summary-with-today", getInstaSummaryWithToday);
insta.get("/stat/top-groups/:groups", getInstaTopGroups);
insta.get("/stat/users-by-status", getInstaUsersByStatus);
insta.get("/stat/groups-by-status", getInstaGroupsByStatus);

insta.get("/stat/new-users-last-days/:days", getInstaNewUsersLastDays);
insta.get("/stat/new-groups-last-days/:days", getInstaNewGroupsLastDays);
insta.get("/stat/newest-last-days/:days", getInstaNewUsersAndGroupsLastDays);
insta.get("/stat/newest-last-weeks/:weeks", getInstaNewUsersAndGroupsLastWeeks);

export default insta;
