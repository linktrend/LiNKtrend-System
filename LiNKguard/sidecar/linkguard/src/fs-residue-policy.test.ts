import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  fileMtimeEligible,
  matchesAnyDenyPrefix,
  pathIsUnderResolvedRoot,
  resolveDenyPrefixes,
} from "./fs-residue-policy.js";

describe("pathIsUnderResolvedRoot", () => {
  const cases: { file: string; root: string; want: boolean }[] = [
    { file: "/work/root", root: "/work/root", want: true },
    { file: "/work/root/file.txt", root: "/work/root", want: true },
    { file: "/work/root/sub/a", root: "/work/root", want: true },
    { file: "/work/root/sub/../root", root: "/work/root", want: true },
    { file: "/work/other/file", root: "/work/root", want: false },
    { file: "/work/root-evil/file", root: "/work/root", want: false },
  ];

  it.each(cases)("file=$file root=$root => $want", ({ file, root, want }) => {
    expect(pathIsUnderResolvedRoot(file, root)).toBe(want);
  });
});

describe("resolveDenyPrefixes", () => {
  const cwd = "/project/cwd";

  it("drops empty segments and normalizes relative entries against cwd", () => {
    expect(resolveDenyPrefixes(["", "  ", "relative/sub"], cwd)).toEqual([
      path.normalize(path.resolve(cwd, "relative/sub")),
    ]);
  });

  it("normalizes absolute paths and strips trailing separators", () => {
    const sep = path.sep;
    const absNoTrail = path.normalize(`${sep}deny${sep}a`);
    const absWithTrail = `${absNoTrail}${sep}`;
    expect(resolveDenyPrefixes([absWithTrail], cwd)).toEqual([absNoTrail]);
  });

  it("overlapping prefixes remain distinct (caller may dedupe elsewhere)", () => {
    const a = path.normalize("/deny/prefix");
    expect(resolveDenyPrefixes(["/deny/prefix", "/deny/prefix/deep"], cwd)).toEqual([
      a,
      path.normalize("/deny/prefix/deep"),
    ]);
  });
});

describe("matchesAnyDenyPrefix", () => {
  const deny = [path.normalize("/keep/secret"), path.normalize("/keep/secret/subdir")];

  it("matches exact deny path", () => {
    expect(matchesAnyDenyPrefix(path.normalize("/keep/secret"), deny)).toBe(true);
  });

  it("matches nested path under deny", () => {
    expect(matchesAnyDenyPrefix(path.normalize("/keep/secret/file.txt"), deny)).toBe(true);
  });

  it("does not match sibling paths", () => {
    expect(matchesAnyDenyPrefix(path.normalize("/keep/other"), deny)).toBe(false);
  });

  it("does not false-positive prefix overlap like /keep/secret vs /keep/secret_extra", () => {
    expect(matchesAnyDenyPrefix(path.normalize("/keep/secret_extra/oops"), deny)).toBe(false);
  });
});

describe("fileMtimeEligible", () => {
  const minAgeSec = 300;
  const ageMs = minAgeSec * 1000;

  it("returns false when neither mtime nor ctime is usable", () => {
    expect(fileMtimeEligible(NaN, NaN, 10_000, minAgeSec)).toBe(false);
    expect(fileMtimeEligible(0, NaN, 10_000, minAgeSec)).toBe(false);
  });

  it("uses mtime when positive", () => {
    const now = 1_000_000;
    const tOldEnough = now - ageMs;
    const tTooNew = now - ageMs + 1;
    expect(fileMtimeEligible(tOldEnough, 0, now, minAgeSec)).toBe(true);
    expect(fileMtimeEligible(tTooNew, 0, now, minAgeSec)).toBe(false);
  });

  it("falls back to ctime when mtime is not positive", () => {
    const now = 2_000_000;
    const c = now - ageMs;
    expect(fileMtimeEligible(0, c, now, minAgeSec)).toBe(true);
  });

  it("boundary: exactly min age is eligible", () => {
    const now = 5_000_000;
    const t = now - ageMs;
    expect(fileMtimeEligible(t, 0, now, minAgeSec)).toBe(true);
  });
});
