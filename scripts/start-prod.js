import { execSync } from "child_process";
import fs from "fs";

const log = (msg) => console.log(`\x1b[35m%s\x1b[0m`, `🌐 [Production] ${msg}`);
const error = (msg) => {
  console.error(`\x1b[31m%s\x1b[0m`, `❌ [Error] ${msg}`);
  process.exit(1);
};

async function deploy() {
  console.log("\n================================================");
  log("Deploying Microservices in Production Mode");
  console.log("================================================\n");

  // 1. Check for .env.production
  if (!fs.existsSync(".env.production")) {
    error(
      ".env.production file not found! Please create it based on .env.production.example.",
    );
  }

  // 2. Start Production Containers
  log("Building and starting production containers...");
  try {
    // Load production env and use prod compose layer
    execSync(
      "docker-compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up --build -d",
      { stdio: "inherit" },
    );
  } catch (e) {
    error("Failed to start production containers.");
  }

  // 3. Wait & Migrate
  log("📜 Applying database migrations (Prisma Deploy)...");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  try {
    execSync("pnpm turbo run db:deploy", { stdio: "inherit" });
  } catch (e) {
    log("Warning: Database deployment failed.");
  }

  console.log("\x1b[32m%s\x1b[0m", "\n🎉 Production environment is UP!");
  log("View Logs: docker-compose --env-file .env.production logs -f");
}

deploy();
