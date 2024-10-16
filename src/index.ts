import { main } from "./main";
import { ENV } from "./services/env";
import * as core from "@actions/core";

if (!ENV.WEBHOOK_URL) {
  core.setFailed("WEBHOOK_URL is not set");
  process.exit(1);
}
if (!ENV.GITHUB_TOKEN) {
  core.setFailed("GITHUB_TOKEN is not set");
  process.exit(1);
}
main();
