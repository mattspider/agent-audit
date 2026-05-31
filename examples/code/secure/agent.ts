// Example: secure agent tools

function tool<T>(definition: T): T {
  return definition;
}

export const tools = {
  searchDocs: tool({
    description: "Search internal documentation",
    parameters: { query: "string" },
    execute: async ({ query }: { query: string }) => {
      return searchIndex(query);
    },
  }),

  getWeather: tool({
    description: "Get weather for a city",
    parameters: { city: "string" },
    execute: async ({ city }: { city: string }) => {
      return fetchWeather(city);
    },
  }),
};

declare function searchIndex(query: string): Promise<string[]>;
declare function fetchWeather(city: string): Promise<{ temp: number }>;
