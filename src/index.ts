import { Hono } from "hono";
import prismaClients from "./lib/prismaClient";
import { generateMovie } from "./generateMovie";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const movies = await prisma.movie.findMany();
  return c.json(movies);
});

app.get("/:id", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const id = c.req.param("id");
  const movie = await prisma.movie.findUnique({
    where: {
      id: Number(id),
    },
  });
  return c.json(movie);
});

const scheduled: ExportedHandlerScheduledHandler<Env> = async (
  event,
  env,
  ctx
) => {
  ctx.waitUntil(generateMovie(env));
};

export default {
  fetch: app.fetch,
  scheduled,
};
