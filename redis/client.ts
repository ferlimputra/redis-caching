import { Request, Response } from "express";
import redis, { RedisClientType } from "redis";

//const REDIS_PORT: number | string = process.env.REDIS_PORT || 6379;

const client: RedisClientType = redis.createClient();

client.on("error", (err: Error) => {
  console.error("Redis Client Error", err);
});

await client.connect();

export default client;

export const cacheResponse = (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const username: string = req.params.username as string;
  client
    .get(username)
    .then((cachedRepos) => {
      if (cachedRepos) {
        console.log(`Cache hit for user ${username}`);
        res.json({ username, repos: JSON.parse(cachedRepos) });
      } else {
        console.log(`Cache miss for user ${username}`);
        res.locals.username = username;
        res.locals.fetchRepos = true;
        next();
      }
    })
    .catch((err: Error) => {
      console.error("Error accessing Redis:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
};
