import axios, {
  // AxiosError,
  AxiosInstance,
  // AxiosResponse,
  // InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

// interface QueueItem {
//   resolve: (value?: unknown) => void;
//   reject: (reason?: any) => void;
// }

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://watchcompany.xyz",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token (401 error) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've tried refreshing for this request

      try {
        // Call your refresh token endpoint
        await axiosInstance.post("/refresh-token");
        const refreshResponse = await axiosInstance.post("/refresh-token");
        console.log("Refresh response:", refreshResponse.data);
        Cookies.set("accessToken", refreshResponse.data, {
          secure: true,
          sameSite: "none",
          // maxAge: 24 * 60 * 60 * 1000,
        });
        console.log("cookiies", document.cookie);

        // After refreshing, retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token is also invalid, redirect to login or handle accordingly
        // This could be due to both tokens being expired or invalid
        console.error("Failed to refresh token:", refreshError);

        // Optionally, redirect to login
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

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
