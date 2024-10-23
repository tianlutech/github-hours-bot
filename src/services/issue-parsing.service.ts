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
      original: date,
      from: moment(`${datePart}T${fromTime}`, "YYYY-MM-DDTHH:mm"),
      to: moment(`${datePart}T${toTime}`, "YYYY-MM-DDTHH:mm"),
    };
  });

  const errors = dates
    .map((date, index) => {
      if (!date.from.isValid() || !date.to.isValid()) {
        return `Date [${index}] from is not valid: ${date.original}`;
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
  const basicPattern = /^\[LOG\]/;
  const basicMatch = issueBody.match(basicPattern);

  if (!basicMatch) {
    return null;
  }

  const logPattern =
    /\[LOG\][\s|\n]*((?:\d{4}-\d{2}-\d{2}\s\d{1,2}:\d{2}\sto\s\d{1,2}:\d{2}\s?)+)\n+([\s\S]*?)\s*(?:\s*\[LOG\]|\s*$)/;

  const match = issueBody.match(logPattern);
  if (!match) {
    return {
      error:
        "Format invalid, first line should be the date, second the description",
    };
  }

  const [_fullMatch, datesMatch, descriptionMatch] = match;

  const result = validateDates(
    datesMatch.split("\n").filter((line) => line.trim() !== "")
  );
  if ("error" in result) {
    return { error: result.error };
  }

  const description = descriptionMatch?.trim() || "";
  if (!description) {
    return { error: "Description is empty" };
  }

  const minutes = result.data.reduce((acc, date) => {
    acc += date.to.diff(date.from, "minutes");
    return acc;
  }, 0);
  return {
    dates: result.data.map((date) => ({
      from: date.from.toISOString(),
      to: date.to.toISOString(),
    })),
    hours: +(minutes / 60).toFixed(2),
    description,
  };
}
