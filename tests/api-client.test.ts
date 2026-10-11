import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, requestApi } from "../src/api/client";

const createResponse = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

describe("requestApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON requests and returns the parsed API response", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(createResponse({ data: { saved: true } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestApi<{ saved: boolean }>("games/demo/favorite", {
      method: "POST",
      body: { userEmail: "lera@example.com" },
    });

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];

    expect(String(requestUrl)).toBe(
      "https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/games/demo/favorite",
    );
    expect(requestOptions).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail: "lera@example.com" }),
    });
    expect(requestOptions?.signal).toBeUndefined();
    expect(result).toEqual({ data: { saved: true } });
  });

  it("uses the server message and status when a request fails", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      createResponse({ message: "Game not found." }, 404),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestApi("games/missing")).rejects.toMatchObject({
      name: "ApiError",
      message: "Game not found.",
      status: 404,
    } satisfies Partial<ApiError>);
  });
});
