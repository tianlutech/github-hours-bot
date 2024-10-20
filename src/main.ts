import { ENV } from "./services/env";
import { parseIssue } from "./services/issue-parsing.service";
import * as core from "@actions/core";
import * as github from "@actions/github";
import WebhookService from "./services/webhook.service";
import { Issue, IssueComment } from "@octokit/webhooks-types";
import moment from "moment";

export async function main() {
  try {
    const { issue, comment } = github.context.payload as {
      issue: Issue;
      comment: IssueComment;
    };
    if (!issue || !comment) {
      return { error: "This script should only be run on issue comments" };
    }

    const octokit = github.getOctokit(ENV.GITHUB_TOKEN);
    const runId = github.context.runId;

    const runUrl = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${runId}`;

    const result = parseIssue(comment.body);
    // Is not a log commit, ignore it
    if (!result) {
      return;
    }
    if ("error" in result) {
      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: +issue.number,
        body: `Error parsing your hour log: ${result.error}\n\nFailed pipeline: ${runUrl}`,
      });
      return;
    }

    await WebhookService.callWebhook({
      issue,
      comment,
      hourLog: result,
    });

    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: +issue.number,
      body: `${github.context.payload.comment!.user.login} logged ${
        result.hours
      } hours`,
    });

    console.info("Success!");
  } catch (error) {
    core.setFailed((error as Error).message);
    console.error(error);
    process.exit(1);
  }
}
