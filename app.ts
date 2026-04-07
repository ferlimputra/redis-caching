import express, { Application, Request, Response } from "express";
import process from "process";
import client, { cacheResponse } from "./redis/client";

const PORT: number | string = process.env.PORT || 3000;
const app: Application = express();

const getRepos = async (req: Request, res: Response) => {
  try {
    const username: string = req.params.username as string;
    console.log(`Fetching repositories of user ${username}...`);

    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
    );
    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }
    const repos = await response.json();

    // Cache to redis
    client.setEx(username, 3600, JSON.stringify(repos));

    res.json({ username, repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

// Router
app.get("/repos/:username", cacheResponse, getRepos);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
