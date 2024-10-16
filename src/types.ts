export type HourLog = {
  dates: Array<{ from: string; to: string }>;
  description: string;
};

export type HourLogError = {
  error: string;
};

export type HourLogResult = HourLog | HourLogError | null;
