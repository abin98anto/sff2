interface ISubscription {
  name: string;
  description: string;
  features: {
    hasVideoCall: boolean;
    hasChat: boolean;
    hasCertificate: boolean;
  };
  price?: number;
  discountPrice?: number;
  discountStartDate?: Date;
  discountValidity?: Date;
  users: Array<{
    userEmail: string;
    startDate: Date;
    endDate?: Date;
  }>;
  isActive: boolean;
  isDeleted: boolean;
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default ISubscription;
