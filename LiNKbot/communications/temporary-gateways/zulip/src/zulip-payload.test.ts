import { describe, expect, it } from "vitest";

import { extractZulipMessageId, extractZulipStreamId, extractZulipTopic } from "./zulip-payload.js";

describe("extractZulipMessageId", () => {
  it("reads top-level numeric or string id", () => {
    expect(extractZulipMessageId({ id: 99 })).toBe("99");
    expect(extractZulipMessageId({ id: "abc" })).toBe("abc");
  });

  it("reads nested message.id", () => {
    expect(extractZulipMessageId({ message: { id: 42 } })).toBe("42");
    expect(extractZulipMessageId({ message: { id: "m-1" } })).toBe("m-1");
  });

  it("prefers top-level id over nested when both present", () => {
    expect(extractZulipMessageId({ id: 1, message: { id: 2 } })).toBe("1");
  });

  it("returns null for null, non-objects, or missing ids", () => {
    expect(extractZulipMessageId(null)).toBeNull();
    expect(extractZulipMessageId(undefined)).toBeNull();
    expect(extractZulipMessageId("x")).toBeNull();
    expect(extractZulipMessageId({})).toBeNull();
    expect(extractZulipMessageId({ message: {} })).toBeNull();
  });
});

describe("extractZulipStreamId", () => {
  it("reads stream_id from top-level or nested message", () => {
    expect(extractZulipStreamId({ stream_id: 5 })).toBe(5);
    expect(extractZulipStreamId({ message: { stream_id: 9 } })).toBe(9);
  });

  it("returns null when stream_id is not a number", () => {
    expect(extractZulipStreamId({ stream_id: "3" } as unknown)).toBeNull();
  });

  it("returns null when missing", () => {
    expect(extractZulipStreamId(null)).toBeNull();
    expect(extractZulipStreamId({})).toBeNull();
  });
});

describe("extractZulipTopic", () => {
  it("prefers topic then message.topic then message.subject", () => {
    expect(extractZulipTopic({ topic: "A" })).toBe("A");
    expect(extractZulipTopic({ message: { topic: "B" } })).toBe("B");
    expect(extractZulipTopic({ message: { subject: "legacy" } })).toBe("legacy");
  });

  it("top-level topic wins over nested", () => {
    expect(extractZulipTopic({ topic: "top", message: { topic: "nested" } })).toBe("top");
  });

  it("returns null when absent or non-string", () => {
    expect(extractZulipTopic(null)).toBeNull();
    expect(extractZulipTopic({ topic: 1 } as unknown)).toBeNull();
    expect(extractZulipTopic({ message: {} })).toBeNull();
  });
});
