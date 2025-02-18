import { IUser } from "./IUser";

export interface ILesson {
  name: string;
  videoUrl: string;
  pdfUrls: string[];
  duration: number;
  order: number;
}

export interface ISection {
  name: string;
  lessons: ILesson[];
  description: string;
  order: number;
}

export interface ICourse {
  createdAt: string | number | Date;
  _id: string;
  basicInfo: {
    title: string;
    subtitle: string;
    category: string;
    topic: string;
    language: string;
    level: string;
    prerequisites: string;
  };
  advanceInfo: {
    thumbnail: string;
    description: string;
  };
  curriculum: ISection[];
  tutors?: IUser[];
  totalDuration: number;
  totalLessons: number;
  enrollmentCount: number;
  isActive: Boolean;
}
