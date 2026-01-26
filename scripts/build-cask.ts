import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const REPO_OWNER = "koki-develop";
const REPO_NAME = "politely";

async function downloadAndHash(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const hash = createHash("sha256");
  hash.update(Buffer.from(buffer));
  return hash.digest("hex");
}

function buildCaskContent(
  version: string,
  sha256Arm: string,
  sha256Intel: string,
): string {
  return `cask "politely" do
  name "Politely"
  desc "話すだけで、丁寧な文章に。"
  homepage "https://github.com/${REPO_OWNER}/${REPO_NAME}"
  version "${version}"

  arch arm: "arm64", intel: "x64"
  url "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v#{version}/Politely-darwin-#{arch}-#{version}.zip"
  sha256 arm:   "${sha256Arm}",
         intel: "${sha256Intel}"

  preflight do
    # ad-hoc 署名で designated requirement を identifier のみに設定
    # これにより、ビルドが変わっても TCC が同じアプリとして認識する
    system_command "/usr/bin/codesign",
                   args: [
                     "--force",
                     "--deep",
                     "--sign", "-",
                     "--identifier", "me.koki.politely",
                     "-r=designated => identifier \\"me.koki.politely\\"",
                     "#{staged_path}/Politely.app",
                   ]
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{staged_path}/Politely.app"]
  end

  app "Politely.app"
end
`;
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      out: {
        type: "string",
        short: "o",
      },
    },
    allowPositionals: true,
  });

  const version = positionals[0];
  if (!version) {
    console.error(
      "Usage: bun run ./scripts/build-cask.ts <version> --out <path>",
    );
    console.error(
      "Example: bun run ./scripts/build-cask.ts 0.0.3 --out politely.rb",
    );
    process.exit(1);
  }

  if (!values.out) {
    console.error("Error: --out flag is required");
    process.exit(1);
  }

  const versionPattern = /^\d+\.\d+\.\d+$/;
  if (!versionPattern.test(version)) {
    console.error(`Error: Invalid version format "${version}". Expected x.x.x`);
    process.exit(1);
  }

  const baseUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v${version}`;
  const armUrl = `${baseUrl}/Politely-darwin-arm64-${version}.zip`;
  const intelUrl = `${baseUrl}/Politely-darwin-x64-${version}.zip`;

  console.log(`Downloading and calculating sha256 for arm64...`);
  const sha256Arm = await downloadAndHash(armUrl);
  console.log(`  sha256 (arm64): ${sha256Arm}`);

  console.log(`Downloading and calculating sha256 for x64...`);
  const sha256Intel = await downloadAndHash(intelUrl);
  console.log(`  sha256 (x64): ${sha256Intel}`);

  const content = buildCaskContent(version, sha256Arm, sha256Intel);
  writeFileSync(values.out, content);
  console.log(`\nCask file written to: ${values.out}`);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
