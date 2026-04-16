import { getMovieDailyNewUsers, getMovieSummaryBasic, getMovieUsersByStatus } from "@/modules/movie/controller";
import { Hono } from "hono";

const movie = new Hono();

movie.get("/stat/summary-basic", getMovieSummaryBasic);
movie.get("/stat/daily-new-users/:days", getMovieDailyNewUsers);
movie.get("/stat/users-by-status", getMovieUsersByStatus);

export default movie;
