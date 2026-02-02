import { execSync } from "child_process";
import fs from "fs";

const log = (msg) =>
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 [Bootstrapper] ${msg}`);
const error = (msg) => {
  console.error(`\x1b[31m%s\x1b[0m`, `❌ [Error] ${msg}`);
  process.exit(1);
};

async function bootstrap() {
  console.log("\n================================================");
  log("Starting Microservices Ecosystem in Dev Mode");
  console.log("================================================\n");

  // 1. Check for .env.development
  if (!fs.existsSync(".env.development")) {
    log(
      ".env.development not found. Creating from .env.development.example...",
    );
    try {
      fs.copyFileSync(".env.development.example", ".env.development");
      log(".env.development created. Please update it with your real secrets!");
    } catch (e) {
      error("Failed to create .env.development file.");
    }
  }

  // 2. Start Infrastructure & Services
  log("Building and starting containers...");
  try {
    // Explicitly load .env.development
    execSync("docker-compose --env-file .env.development up -d --build", {
      stdio: "inherit",
    });
  } catch (e) {
    error("Failed to start docker-compose.");
  }

  // 3. Wait for MySQL
  log("Waiting for MySQL to be ready...");
  let ready = false;
  for (let i = 0; i < 15; i++) {
    try {
      execSync(
        "docker-compose --env-file .env.development exec -T mysql mysqladmin ping -uuser -ppassword",
        { stdio: "ignore" },
      );
      ready = true;
      break;
    } catch (e) {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log("");

  if (!ready) error("MySQL took too long to start.");

  // 4. Prisma
  log("Generating database clients...");
  try {
    execSync("pnpm turbo run generate", { stdio: "inherit" });
  } catch (e) {
    log("Warning: Prisma generation failed.");
  }

  log("Everything is ready!");
  log("Admin Panel: http://localhost:3002");

  // Follow logs with the specific env file
  try {
    execSync("docker-compose --env-file .env.development logs -f", {
      stdio: "inherit",
    });
  } catch (e) {
    log("Stopping services...");
    execSync("docker-compose --env-file .env.development down", {
      stdio: "inherit",
    });
  }
}

bootstrap();
