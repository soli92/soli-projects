import { describe, expect, it } from "vitest";

import { extractKnownSections, parseMarkdownSections } from "./parser";

describe("parseMarkdownSections", () => {
  it("parses base markdown with H2 sections", () => {
    const input = [
      "intro text",
      "## Obiettivi",
      "- a",
      "- b",
      "## Lezioni",
      "lesson text",
      "## Next",
      "open task",
    ].join("\n");

    expect(parseMarkdownSections(input)).toEqual({
      _intro: "intro text",
      Obiettivi: "- a\n- b",
      Lezioni: "lesson text",
      Next: "open task",
    });
  });

  it("normalizes section names with emoji", () => {
    const input = ["## 🎯 Obiettivi", "- item"].join("\n");
    expect(parseMarkdownSections(input)).toEqual({
      Obiettivi: "- item",
    });
  });

  it("treats H2 and H3 both as sections", () => {
    const input = ["## Stato", "ok", "### Debt", "to fix"].join("\n");
    expect(parseMarkdownSections(input)).toEqual({
      Stato: "ok",
      Debt: "to fix",
    });
  });
});

describe("extractKnownSections", () => {
  it("extracts known sections with fuzzy matching", () => {
    const known = extractKnownSections({
      _intro: "hello",
      Obiettivi: "A",
      "Lezioni cristallizzate": "B",
      "Prossimi passi": "C",
    });

    expect(known).toEqual({
      intro: "hello",
      objectives: "A",
      lessons: "B",
      open: "C",
    });
  });

  it("returns empty object on empty input", () => {
    expect(parseMarkdownSections("")).toEqual({});
    expect(extractKnownSections({})).toEqual({});
  });
});
