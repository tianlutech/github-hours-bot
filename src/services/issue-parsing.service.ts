import moment from "moment";
import { HourLogResult } from "../types";

function validateDates(datesMatch: string[]):
  | {
      data: Array<{ from: moment.Moment; to: moment.Moment }>;
    }
  | {
      error: string;
    } {
  const dates = datesMatch.map((date) => {
    const [datePart, fromTime, toTime] = date
      .split(" ")
      .filter((part) => part !== "to");
    return {
      from: moment(`${datePart}T${fromTime}`),
      to: moment(`${datePart}T${toTime}`),
    };
  });

  const errors = dates
    .map((date, index) => {
      if (!date.from.isValid() || !date.to.isValid()) {
        return `Date ${index} from is not valid`;
      }
      return [];
    })
    .flat();
  if (errors.length > 0) {
    return { error: errors.join("\n") };
  }
  return { data: dates };
}

export function parseIssue(issueBody: string): HourLogResult {
  const basicPattern = /^### LOG/;
  const basicMatch = issueBody.match(basicPattern);

  if (!basicMatch) {
    return null;
  }

  const logPattern =
    /### LOG\s*((?:\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}\sto\s\d{2}:\d{2}\s?)+)\n([\s\S]*?)\s*###/;
  const match = issueBody.match(logPattern);

  if (!match) {
    return {
      error:
        "Format invalid, first line should be an address, second the description",
    };
  }

  const [_fullMatch, datesMatch, descriptionMatch] = match;

  const result = validateDates(datesMatch.split("\n"));
  if ("error" in result) {
    return { error: result.error };
  }

  const description = descriptionMatch?.trim() || "";
  if (!description) {
    return { error: "Description is empty" };
  }

  return {
    dates: result.data.map((date) => ({
      from: date.from.toISOString(),
      to: date.to.toISOString(),
    })),
    description,
  };
}
