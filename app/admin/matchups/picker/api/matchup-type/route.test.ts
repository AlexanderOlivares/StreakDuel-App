import { MatchupType } from "@/components/ui/Cards/AdminGamePickerCard";
import { falsifyUnusedMatchupTypes } from "./route";

describe("falsifyUnusedMatchupTypes", () => {
  const updateBody = falsifyUnusedMatchupTypes(MatchupType.Moneyline);
  test("has 4 adminUse properties", () => {
    expect(Object.keys(updateBody).length).toBe(4);
  });

  test("all keys start with adminUse", () => {
    Object.keys(updateBody).forEach(key => {
      expect(key).toMatch(/^adminUse/);
    });
  });

  test("only one property is true", () => {
    const trueCount = Object.values(updateBody).filter(Boolean).length;
    expect(trueCount).toBe(1);
  });
});
