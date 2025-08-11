// tests/io.test.ts
import { describe, it, expect } from "vitest";
import { exportPanel, importPanel } from "@/lib/data/io";

const sample = [
  { id: "A", label: "Alpha", cluster: "C1", deps: [], xp: 10 },
  { id: "B", label: "Beta", cluster: "C1", deps: ["A"], xp: 10 },
];

describe("I/O round-trip", () => {
  it("exports and imports without loss", () => {
    const json = exportPanel(sample as any);
    const back = importPanel(json);
    expect(back.length).toBe(sample.length);
    expect(back[0].id).toBe("A");
    expect(back[1].deps).toEqual(["A"]);
  });
});
