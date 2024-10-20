import moment from "moment";
import { parseIssue } from "./services/issue-parsing.service";
import { createContext, seedEnv } from "./tests/test.factory";
import { mockedAxios, mockGithub } from "./tests/setup-test";
import { main } from "./main";
import { HourLogError } from "./types";

describe("GITHUB HOUR LOG", () => {
  describe("PARSE ISSUE", () => {
    it("ERROR: Invalid Format", () => {
      const parseIssueError = parseIssue as (body: string) => HourLogError;
      expect(parseIssueError("[LOG]\n")?.error).toMatch(/^Format invalid/);
      expect(parseIssueError("[LOG] 2123123 \ndssd asdasd\n")?.error).toMatch(
        /^Format invalid/
      );
      expect(
        parseIssueError("[LOG] 2024 10:00 \ndssd asdasd\n")?.error
      ).toMatch(/^Format invalid/);
      expect(
        parseIssueError("[LOG] 2024 10:00 to 11:2 \ndssd asdasd\n")?.error
      ).toMatch(/^Format invalid/);
      expect(parseIssueError("[LOG] 2024 10:00 to 11:20")?.error).toMatch(
        /^Format invalid/
      );
    });
    it("OK: Parse Simple Issue", () => {
      const input = "[LOG]\n2024-10-10 09:00 to 11:00\nHello World\n[LOG]";
      const expected = {
        hours: 2,
        dates: [
          {
            from: moment("2024-10-10T09:00").toISOString(),
            to: moment("2024-10-10T11:00").toISOString(),
          },
        ],
        description: "Hello World",
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });

    it("OK: Parse Without Ending", () => {
      const input = "[LOG]\n2024-10-10 09:00 to 11:00\nHello World";
      const expected = {
        dates: [
          {
            from: moment("2024-10-10T09:00").toISOString(),
            to: moment("2024-10-10T11:00").toISOString(),
          },
        ],
        hours: 2,
        description: "Hello World",
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });

    it("OK: Parse Without \\n at the start", () => {
      const input = "[LOG] 2024-10-02 9:00 to 12:00\n\nTo Log hours 222";
      const expected = {
        dates: [
          {
            from: moment("2024-10-10T09:00").toISOString(),
            to: moment("2024-10-10T11:00").toISOString(),
          },
        ],
        hours: 2,
        description: "Hello World",
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });

    it("ERROR: Date with issue return error", () => {
      const input = "[LOG]\n2024-34-12 09:88 to 11:00\nHello World\n[LOG]";
      const expected = {
        error: "Date 0 from is not valid",
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });

    it("OK: Parse Several Dates", () => {
      const input =
        "[LOG]\n2024-10-10 09:00 to 11:00\n2024-10-11 12:00 to 14:00\nHello World\n[LOG]";
      const expected = {
        dates: [
          {
            from: moment("2024-10-10T09:00").toISOString(),
            to: moment("2024-10-10T11:00").toISOString(),
          },
          {
            from: moment("2024-10-11T12:00").toISOString(),
            to: moment("2024-10-11T14:00").toISOString(),
          },
        ],
        description: "Hello World",
        hours: 4,
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });

    it("ERROR: Several Date with issue one returns error", () => {
      const input =
        "[LOG]\n2024-10-12 09:33 to 11:00\n2024-10-12 09:88 to 11:00\nHello World\n[LOG]";
      const expected = {
        error: "Date 1 from is not valid",
      };
      const result = parseIssue(input);
      expect(result).toEqual(expected);
    });
  });

  describe("WEBHOOK", () => {
    beforeEach(() => {
      seedEnv();
    });
    it("OK: Webhook is called", () => {
      const context = createContext({
        comment: {
          body: "[LOG]\n2024-10-12 09:33 to 11:00\n2024-10-12 09:22 to 11:00\nHello World\n[LOG]",
        },
      });

      Object.defineProperty(mockGithub, "context", {
        value: context,
      });

      main();

      expect(mockedAxios.post).toHaveBeenCalled();
      const params = mockedAxios.post.mock.calls[0][1];
      expect(params).toEqual({
        repository: process.env.GITHUB_REPOSITORY?.split("/")[1] || "",
        issueId: context.payload.issue.id,
        issueName: context.payload.issue.title,
        authorId: context.payload.comment.user.id,
        authorName: context.payload.comment.user.login,
        commentId: context.payload.comment.id,
        commentUrl: context.payload.comment.url,
        issueUrl: context.payload.issue.url,
        logHours: 3.08,
        logDescription: "Hello World",
        logDates: [
          {
            from: moment("2024-10-12T09:33").toISOString(),
            to: moment("2024-10-12T11:00").toISOString(),
          },
          {
            from: moment("2024-10-12T09:22").toISOString(),
            to: moment("2024-10-12T11:00").toISOString(),
          },
        ],
      });
    });
  });
});
