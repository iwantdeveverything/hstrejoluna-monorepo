import { spawn } from "node:child_process";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(currentDir, "..");
const fixturePath = path.join(appRoot, "components", "__verify-build-failure__.stories.tsx");
const outputDir = path.join(appRoot, "storybook-static-failure-check");

const runCommand = () =>
  new Promise((resolve) => {
    const child = spawn(
      "npm",
      ["run", "storybook:build", "--", "--output-dir", outputDir],
      {
        cwd: appRoot,
        env: {
          ...process.env,
          CI: "1",
          STORYBOOK_DISABLE_TELEMETRY: "1",
        },
        stdio: "pipe",
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      });
    });
  });

const fixtureContent = `import type { Meta } from "@storybook/nextjs-vite";
import { missingModule } from "./__intentionally-missing-module__";

const meta = {
  title: "Verification/Broken Story",
} satisfies Meta;

export default meta;

export const Broken = () => missingModule();
`;

const verify = async () => {
  await writeFile(fixturePath, fixtureContent, "utf8");

  const result = await runCommand();
  if (result.code === 0) {
    console.error("Expected Storybook build to fail with a broken story, but it succeeded.");
    process.exitCode = 1;
    return;
  }

  console.log("Verified: Storybook build fails deterministically for broken story imports.");
};

try {
  await verify();
} finally {
  await rm(fixturePath, { force: true });
  await rm(outputDir, { recursive: true, force: true });
}
