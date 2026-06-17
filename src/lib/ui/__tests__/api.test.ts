import { api } from "../api";

const mockFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockFetch as unknown as typeof fetch;
});

beforeEach(() => {
  mockFetch.mockReset();
});

function ok(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function fail(status = 500) {
  return Promise.resolve({ ok: false, status });
}

describe("api.dashboard", () => {
  it("calls GET /api/teacher/dashboard", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await api.dashboard();
    expect(mockFetch).toHaveBeenCalledWith("/api/teacher/dashboard", { cache: "no-store" });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockReturnValueOnce(fail(503));
    await expect(api.dashboard()).rejects.toThrow("503");
  });
});

describe("api.studentGraph", () => {
  it("calls GET /api/students/:id/graph", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await api.studentGraph("alice");
    expect(mockFetch).toHaveBeenCalledWith("/api/students/alice/graph", { cache: "no-store" });
  });
});

describe("api.nextExercise", () => {
  it("calls GET /api/students/:id/exercise/next", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await api.nextExercise("bob");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/students/bob/exercise/next",
      { cache: "no-store" },
    );
  });
});

describe("api.feed", () => {
  it("calls GET /api/students/:id/feed", async () => {
    mockFetch.mockReturnValueOnce(ok({ feed: [] }));
    await api.feed("carol");
    expect(mockFetch).toHaveBeenCalledWith("/api/students/carol/feed", { cache: "no-store" });
  });

  it("throws on error", async () => {
    mockFetch.mockReturnValueOnce(fail(404));
    await expect(api.feed("nobody")).rejects.toThrow("404");
  });
});

describe("api.submit", () => {
  it("calls POST /api/students/:id/submit with JSON body", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    const body = { exerciseId: "ex-1", answer: "1/2", viaOcr: false };
    await api.submit("alice", body);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/students/alice/submit",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  });

  it("throws on error", async () => {
    mockFetch.mockReturnValueOnce(fail(400));
    await expect(api.submit("x", { exerciseId: "e", answer: "a" })).rejects.toThrow("400");
  });
});

describe("api.ocr", () => {
  it("calls POST /api/ocr", async () => {
    mockFetch.mockReturnValueOnce(ok({ text: "3/4", confidence: "high" }));
    await api.ocr({ sample: "fraction" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ocr",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("api.chat", () => {
  it("calls POST /api/students/:id/chat", async () => {
    mockFetch.mockReturnValueOnce(ok({ reply: "Sure!" }));
    await api.chat("alice", { message: "help me" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/students/alice/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("api.ask", () => {
  it("calls POST /api/teacher/ask", async () => {
    mockFetch.mockReturnValueOnce(ok({ answer: "42" }));
    await api.ask({ question: "what?" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/teacher/ask",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("api.visualize", () => {
  it("calls POST /api/teacher/course/visualize", async () => {
    mockFetch.mockReturnValueOnce(ok({ visualization: null }));
    await api.visualize({ conceptId: "fractions", expression: "1/2" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/teacher/course/visualize",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
