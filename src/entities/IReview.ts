export default interface IReview {
  _id?: string;
  ratings: number;
  comments: string;
  userId: string;
  courseId: string;
}
