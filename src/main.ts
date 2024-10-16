import { ENV } from "./services/env";
import { parseIssue } from "./services/issue-parsing.service";
import * as core from "@actions/core";
import * as github from "@actions/github";
import WebhookService from "./services/webhook.service";
import { Issue, IssueComment } from "@octokit/webhooks-types";
export async function main() {
  try {
    console.log(github.context.repo);
    const { issue, comment } = github.context.payload as {
      issue: Issue;
      comment: IssueComment;
    };
    if (!issue || !comment) {
      return { error: "This script should only be run on issue comments" };
    }

    const octokit = github.getOctokit(ENV.GITHUB_TOKEN);
    const result = parseIssue(comment.body);
    // Is not a log commit, ignore it
    if (!result) {
      return;
    }
    if ("error" in result) {
      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: +issue.number,
        body: `Error parsing your hour log: ${result.error}`,
      });
      return;
    }

    WebhookService.callWebhook({
      issue,
      comment,
      hourLog: result,
    });
    console.info("Success!.");
  } catch (error) {
    core.setFailed((error as Error).message);
    process.exit(1);
  }
}
