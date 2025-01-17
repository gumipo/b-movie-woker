import OpenAI from "openai";
import prismaClients from "./lib/prismaClient";

export const generateMovie = async (env: Env) => {
  const prisma = await prismaClients.fetch(env.DB);
  const data = (await generateMovieTitle(env)) as any;

  console.log(data.movies);

  const promises = data.movies.map(async (movie: any) => {
    const title = movie.title;
    const description = movie.description;
    const genre = movie.genre;
    // const genres: { name: string }[] = genre.map((g: string) => ({
    //   name: g,
    // }));

    // await prisma.genre.createMany({
    //   data: genres,
    // });

    await prisma.movie.create({
      data: {
        title,
        description,
        year: movie.release_year,
        src: "test",
      },
    });
  });

  await Promise.all(promises);
};

const generateMovieTitle = async (env: Env) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "B級映画のタイトル、あらすじ、ジャンルを３つ考えてほしい。例：『寿司VS忍者』例はあくまで既存のB級映画のタイトルです。オリジナルのいかにもB級映画っぽいタイトルを考えてください。\n",
          },
        ],
      },
      {
        role: "user",
        content: "B級映画を３つ生成してください。",
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "b_movie_list",
        strict: true,
        schema: {
          type: "object",
          properties: {
            movies: {
              type: "array",
              description: "B級映画のリスト",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "映画のタイトル",
                  },
                  genre: {
                    type: "array",
                    description: "映画のジャンル",
                    items: {
                      type: "string",
                    },
                  },
                  release_year: {
                    type: "number",
                    description: "映画の公開年",
                  },
                  description: {
                    type: "string",
                    description: "映画の概要",
                  },
                },
                required: ["title", "genre", "release_year", "description"],
                additionalProperties: false,
              },
            },
          },
          required: ["movies"],
          additionalProperties: false,
        },
      },
    },
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const movies = completion.choices[0].message.parsed;
  return movies;
};
