import { getMovieLatestMovies } from "@/modules/movie/controller";
import { getMovieSummaryBasic } from "@/modules/movie/controller";
import { getMovieDailyNewUsers } from "@/modules/movie/controller";
import { getMovieDailyTotalUsers } from "@/modules/movie/controller";
import { getMovieTopActiveUsers } from "@/modules/movie/controller";
import { getMovieUsersByStatus } from "@/modules/movie/controller";
import { getMovieTop5Movies } from "@/modules/movie/controller";
import { getMovieTopMovies } from "@/modules/movie/controller";
import { Hono } from "hono";

const movie = new Hono();

movie.get("/stat/summary-basic", getMovieSummaryBasic);
movie.get("/stat/users-by-status", getMovieUsersByStatus);
movie.get("/stat/top-movies/:topCount", getMovieTopMovies);
movie.get("/stat/latest-movies/:limit", getMovieLatestMovies);
movie.get("/stat/daily-total-users/:days", getMovieDailyTotalUsers);
movie.get("/stat/daily-new-users/:days", getMovieDailyNewUsers);
movie.get("/stat/top-users/:topCount", getMovieTopActiveUsers);
movie.get("/stat/top-movies", getMovieTop5Movies);

export default movie;
