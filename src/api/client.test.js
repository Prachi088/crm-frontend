import {
  apiRequest,
  deleteLeadNote,
  normalizeApiBaseUrl,
} from "./client";

function mockResponse({ ok = true, status = 200, body = "" }) {
  return Promise.resolve({
    ok,
    status,
    text: () => Promise.resolve(body),
  });
}

describe("api client", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
    delete process.env.REACT_APP_API_URL;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("normalizes api base urls with and without api suffix", () => {
    expect(normalizeApiBaseUrl()).toBe("http://localhost:3000/api");
    expect(normalizeApiBaseUrl("https://example.com")).toBe("https://example.com/api");
    expect(normalizeApiBaseUrl("https://example.com/api/")).toBe("https://example.com/api");
  });

  test("adds bearer headers and parses json bodies", async () => {
    process.env.REACT_APP_API_URL = "https://crm.example.com";
    localStorage.setItem("token", "secret-token");
    fetch.mockImplementation(() =>
      mockResponse({
        body: JSON.stringify({ ok: true }),
      })
    );

    const data = await apiRequest("/leads", {
      method: "POST",
      body: { name: "Alice" },
      auth: true,
    });

    expect(data).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith("https://crm.example.com/api/leads", {
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Alice" }),
    });
  });

  test("throws normalized api errors for non-2xx responses", async () => {
    fetch.mockImplementation(() =>
      mockResponse({
        ok: false,
        status: 400,
        body: JSON.stringify({ message: "Invalid email" }),
      })
    );

    await expect(
      apiRequest("/auth/login", {
        method: "POST",
        body: { email: "bad@example.com", password: "secret" },
      })
    ).rejects.toMatchObject({
      message: "Invalid email",
      status: 400,
    });
  });

  test("returns null for empty delete responses", async () => {
    localStorage.setItem("token", "secret-token");
    fetch.mockImplementation(() =>
      mockResponse({
        status: 204,
      })
    );

    await expect(deleteLeadNote(12)).resolves.toBeNull();
  });
});
