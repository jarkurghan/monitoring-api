import { getInstaWeeklyNewUsersGroupsTashkent } from "@/modules/insta/controller";
import { getInstaGroupsByStatus } from "@/modules/insta/controller";
import { getInstaUsersByStatus } from "@/modules/insta/controller";
import { getInstaSummaryBasic } from "@/modules/insta/controller";
import { getInstaTopGroups } from "@/modules/insta/controller";
import { Hono } from "hono";

const insta = new Hono();

insta.get("/stat/summary-basic", getInstaSummaryBasic);
insta.get("/stat/users-by-status", getInstaUsersByStatus);
insta.get("/stat/groups-by-status", getInstaGroupsByStatus);
insta.get("/stat/top-groups/:groups", getInstaTopGroups);
insta.get("/stat/weekly-tashkent/:weeks", getInstaWeeklyNewUsersGroupsTashkent);

export default insta;
