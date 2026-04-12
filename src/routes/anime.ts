import { getAnimeUsersByStatus } from "@/modules/anime/controller";
import { getAnimeDailyNewUsers } from "@/modules/anime/controller";
import { getAnimeDailyTotalUsers } from "@/modules/anime/controller";
import { getAnimeSummaryBasic } from "@/modules/anime/controller";
import { getAnimeTopAnimes } from "@/modules/anime/controller";
import { getAnimeTopUsers } from "@/modules/anime/controller";
import { getAnimeTopDubs } from "@/modules/anime/controller";
import { Hono } from "hono";

const anime = new Hono();

anime.get("/stat/summary-basic", getAnimeSummaryBasic);
anime.get("/stat/users-by-status", getAnimeUsersByStatus);
anime.get("/stat/daily-new-users/:days", getAnimeDailyNewUsers);
anime.get("/stat/daily-total-users/:days", getAnimeDailyTotalUsers);
anime.get("/stat/top-animes/:topCount", getAnimeTopAnimes);
anime.get("/stat/top-users/:topCount", getAnimeTopUsers);
anime.get("/stat/top-dubs/:topCount", getAnimeTopDubs);

export default anime;
