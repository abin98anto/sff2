export default interface IOrder {
  userEmail: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status?: "pending" | "completed" | "failed";
}
