import { vi } from "vitest";

export const mockSerpApi = () => {
  const mock = vi.hoisted(() => {
    return {
      getJson: vi.fn(),
    };
  });

  vi.mock("serpapi", () => {
    return {
      getJson: mock.getJson,
    };
  });

  return mock;
};
