export type HourLog = {
  dates: Array<{ from: string; to: string }>;
  hours: number;
  description: string;
};

export type HourLogError = {
  error: string;
};

export type HourLogResult = HourLog | HourLogError | null;
