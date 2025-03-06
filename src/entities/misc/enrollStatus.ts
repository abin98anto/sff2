export enum EnrollStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  QUIT = "quit",
  PASSED = "passed",
}

type enrollStatus =
  | EnrollStatus.PENDING
  | EnrollStatus.COMPLETED
  | EnrollStatus.QUIT
  | EnrollStatus.PASSED;

export default enrollStatus;
