import axios, {
  // AxiosError,
  AxiosInstance,
  // AxiosResponse,
  // InternalAxiosRequestConfig,
} from "axios";

// interface QueueItem {
//   resolve: (value?: unknown) => void;
//   reject: (reason?: any) => void;
// }

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://watchcompany.xyz',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// let isRefreshing: boolean = false;
// let failedQueue: QueueItem[] = [];

// const processQueue = (
//   error: Error | null,
//   token: string | null = null
// ): void => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve();
//     }
//   });

//   failedQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse): AxiosResponse => {
//     return response;
//   },
//   async (error: AxiosError): Promise<unknown> => {
//     console.log("refereshin token");
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status !== 401 || originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     originalRequest._retry = true;

//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         failedQueue.push({ resolve, reject });
//       })
//         .then(() => {
//           return axiosInstance(originalRequest);
//         })
//         .catch((err) => {
//           return Promise.reject(err);
//         });
//     }

//     isRefreshing = true;

//     try {
//       await axiosInstance.post("/refresh-token");

//       processQueue(null);
//       isRefreshing = false;
//       return axiosInstance(originalRequest);
//     } catch (refreshError) {
//       processQueue(
//         refreshError instanceof Error
//           ? refreshError
//           : new Error("Token refresh failed")
//       );
//       isRefreshing = false;
//       return Promise.reject(refreshError);
//     }
//   }
// );

export default axiosInstance;
