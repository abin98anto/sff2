export enum EnrollStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  QUIT = "quit",
}

type enrollStatus =
  | EnrollStatus.PENDING
  | EnrollStatus.COMPLETED
  | EnrollStatus.QUIT;

export default enrollStatus;
