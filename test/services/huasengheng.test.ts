import { describe, it, vi } from "vitest";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";

describe("fetch data from huasengheng", async () => {
  let huasengheng: Huasengheng;

  beforeAll(() => {
    huasengheng = new Huasengheng();
  });

  it("should get current gold price from Huasengheng API", async () => {
    const result = await huasengheng.getCurrentHuasenghengPrice();
    expect(result).toBeDefined();
  });

  it("should not be able to get current gold price from Huasengheng API", async () => {
    const getCurrentPriceSpy = vi.spyOn(Huasengheng.prototype, "getCurrentPrice").mockResolvedValueOnce(undefined!);
    const result = await huasengheng.getCurrentHuasenghengPrice();
    expect(result).toBeUndefined();
    getCurrentPriceSpy.mockRestore();
  });

});
