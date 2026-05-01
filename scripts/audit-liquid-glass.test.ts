import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("audit-liquid-glass", () => {
  it("should pass all liquid-glass audit rules", () => {
    const output = execSync("npx tsx scripts/audit-liquid-glass.ts").toString();
    
    // T-80 / S7.1
    expect(output).toContain("PASS  no-raw-backdrop-blur-in-migrated-surfaces");
    
    // T-81 / S7.2
    expect(output).toContain("PASS  every-migrated-surface-imports-LiquidGlass");
    
    // T-82 / S3.4
    expect(output).toContain("PASS  no-userAgent-in-primitive");
    
    // T-83 / S5.4
    expect(output).toContain("PASS  no-runtime-viewport-listeners");
    
    // T-85 / S9.3
    expect(output).toContain("PASS  no-light-glass-variant");
  });
});
