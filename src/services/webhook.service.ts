import { HourLog } from "./../types";
import { context } from "@actions/github/lib/utils";
import axios from "axios";
import { Issue, IssueComment } from "@octokit/webhooks-types";
import { ENV } from "./env";

export default class WebhookService {
  public static async callWebhook({
    issue,
    comment,
    hourLog,
  }: {
    issue: Issue;
    comment: IssueComment;
    hourLog: HourLog;
  }) {
    const { repo } = context.repo;

    if (!issue || !comment) {
      return { error: "This script should only be run on issue comments" };
    }

    const data = {
      repository: repo,
      issueId: issue.id,
      issueName: issue.title,
      commentId: comment.id,
      commentUrl: comment.url,
      issueUrl: issue.url,
      authorId: comment.user.id,
      authorName: comment.user.login,
      logDates: hourLog.dates,
      logHours: hourLog.hours,
      logDescription: hourLog.description,
    };
    try {
      const response = await axios.post(ENV.WEBHOOK_URL, data);
      if (response.status !== 200) {
        return {
          error: `Call Failed${response.status} - ${
            response.data
              ? JSON.stringify(response.data, null, 4)
              : response.statusText
          }`,
        };
      }
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
}
