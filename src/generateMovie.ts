import OpenAI from "openai";

export const generateMovie = async (env: Env) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "あなたはB級映画を考える映画監督です。" },
      {
        role: "user",
        content: "Write a haiku about recursion in programming.",
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "movie_schema",
        schema: {
          type: "object",
          properties: {
            title: {
              description: "映画のタイトル",
              type: "string",
            },
            description: {
              description: "映画のあらすじ",
              type: "string",
            },
          },
          additionalProperties: false,
        },
      },
    },
  });
};
