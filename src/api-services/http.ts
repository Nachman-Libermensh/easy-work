/**
 * שירות HTTP כללי מעל axios.
 *
 * מטרות עיקריות:
 * - ריכוז baseURL, timeout וכותרות ברירת־מחדל במקום אחד.
 * - המרה אוטומטית של payload הכוללים קבצים ל-FormData.
 * - Interceptors לבקשות ותגובות לצורך לוגים וטיפול בשגיאות נפוצות.
 * - מעטפת טיפוסית סביב פעולות GET/POST/PUT/PATCH/DELETE שמחזירה מבנה עקבי.
 */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

/**
 * תצורת אתחול לשירות ה-HTTP.
 */
interface HttpConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * תגובת HTTP עטופה במבנה אחיד ונוח לשימוש.
 */
interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HttpService: עטיפה נוחה מעל axios עם ברירות־מחדל חכמות.
 *
 * דוגמה לשימוש:
 * const http = new HttpService({ baseURL: "https://api.example.com" });
 * const res = await http.get<User>("/users", { q: "john" });
 * console.log(res.data);
 */
class HttpService {
  private axiosInstance: AxiosInstance;

  /**
   * אתחול השירות והגדרת axios instance עם ברירות־מחדל.
   *
   * @param config תצורת אתחול: baseURL/timeout/headers
   */
  constructor(config: HttpConfig = {}) {
    this.axiosInstance = axios.create({
      // ברירת המחדל מצביעה על נתיבי API הפנימיים של Next.js
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
      timeout: config.timeout ?? 120_000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      withCredentials: true, // <<< הוסף שורה זו!
    });

    this.setupInterceptors();
  }

  /**
   * בדיקה אם האובייקט מכיל קבצים (File/Blob/FileList) באופן ישיר או מקונן.
   * משמש להחלטה האם להמיר את הנתונים ל-FormData.
   */
  private hasFiles(data: any): boolean {
    if (typeof window === "undefined") return false;
    if (!data || typeof data !== "object") return false;

    const checkValue = (value: any): boolean => {
      if (value instanceof File || value instanceof Blob) {
        return true;
      }
      if (typeof FileList !== "undefined" && value instanceof FileList) {
        return value.length > 0;
      }
      if (Array.isArray(value)) {
        return value.some((item) => checkValue(item));
      }
      if (value && typeof value === "object") {
        return Object.values(value).some((val) => checkValue(val));
      }
      return false;
    };

    return Object.values(data).some((value) => checkValue(value));
  }

  /**
   * המרה ל-FormData כאשר ה-payload כולל קבצים או מבני נתונים מורכבים.
   * מערכים/אובייקטים יומרו למחרוזות JSON, וקבצים יתווספו כפי שהם.
   */
  private convertToFormData(data: any): FormData {
    const formData = new FormData();

    const appendToFormData = (key: string, value: any) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        Array.from(value).forEach((file, index) => {
          formData.append(`${key}[${index}]`, file);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${key}[${index}]`, item);
          } else if (typeof item === "object" && item !== null) {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (value && typeof value === "object") {
        // אובייקטים רגילים נשמרים כמחרוזת JSON כדי לשמר מבנה.
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    };

    Object.entries(data).forEach(([key, value]) => {
      appendToFormData(key, value);
    });

    return formData;
  }

  /**
   * מכין את קונפיגורציית הבקשה לפני שליחה:
   * - אם יש קבצים: ממיר ל-FormData ומסיר Content-Type ידני (שייקבע אוטומטית עם boundary).
   * - אחרת: מחזיר את הנתונים כפי שהם.
   */
  private prepareRequestConfig(
    data: any,
    config: AxiosRequestConfig = {},
  ): { processedData: any; finalConfig: AxiosRequestConfig } {
    if (this.hasFiles(data)) {
      const formData = this.convertToFormData(data);
      return {
        processedData: formData,
        finalConfig: {
          ...config,
          headers: {
            ...config.headers,
            // לא מגדירים Content-Type ידנית כדי לאפשר ל-axios לקבוע boundary ל-FormData
            "Content-Type": undefined,
          },
        },
      };
    }

    return {
      processedData: data,
      finalConfig: config,
    };
  }

  /**
   * הגדרת interceptors לבקשות ותגובות:
   * - בקשה: לוג בסיסי על ה-URL והשיטה.
   * - תגובה/שגיאה: טיפול בסיסי בקודי שגיאה נפוצים (401/500).
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // לוג עזר לזיהוי היכן מתבצעת הבקשה
        // console.log(
        //   `Making ${config.method?.toUpperCase()} request to: ${config.url}`
        // );

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // דוגמה לטיפול בשגיאות לפי קוד סטטוס
        if (error.response?.status === 401) {
          // Unauthorized - כאן אפשר לנתב ל-login או לנקות טוקן
          console.error("Unauthorized access - redirecting to login");
        } else if (error.response?.status === 500) {
          console.error("Server error occurred");
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * עוטף את תשובת axios ומחזיר מבנה עקבי של HttpResponse.
   */
  private handleResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * המרה של שגיאת axios להודעת שגיאה קריאה ומרוכזת.
   * זורק Error כדי לשמר זרימת חריגות אחידה בשכבת הקריאה.
   */
  private handleError(error: AxiosError): never {
    if (error.response) {
      // התקבלה תגובת שרת עם קוד סטטוס (4xx/5xx)
      throw new Error(
        `HTTP Error: ${error.response.status} ${error.response.statusText}`,
      );
    } else if (error.request) {
      // הבקשה נשלחה אבל לא התקבלה תגובה (בעיה ברשת/שרת)
      throw new Error("Network Error: No response received");
    } else {
      // שגיאה בבניית הבקשה לפני שליחה
      throw new Error(`Request Error: ${error.message}`);
    }
  }

  /**
   * שליפת נתונים (GET).
   * @param endpoint נתיב ה-API
   * @param params פרמטרים לשורת השאילתה
   * @param config הגדרות axios נוספות
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        params,
        ...config,
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * יצירת משאב (POST).
   * מבצע המרה ל-FormData אוטומטית אם זוהו קבצים.
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const { processedData, finalConfig } = this.prepareRequestConfig(
        data,
        config,
      );
      const response = await this.axiosInstance.post<T>(
        endpoint,
        processedData,
        finalConfig,
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * עדכון מלא של משאב (PUT).
   * מבצע המרה ל-FormData אוטומטית אם זוהו קבצים.
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const { processedData, finalConfig } = this.prepareRequestConfig(
        data,
        config,
      );
      const response = await this.axiosInstance.put<T>(
        endpoint,
        processedData,
        finalConfig,
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * מחיקת משאב (DELETE).
   */
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * עדכון חלקי של משאב (PATCH).
   * מבצע המרה ל-FormData אוטומטית אם זוהו קבצים.
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const { processedData, finalConfig } = this.prepareRequestConfig(
        data,
        config,
      );
      const response = await this.axiosInstance.patch<T>(
        endpoint,
        processedData,
        finalConfig,
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * הוספת/עדכון כותרת ברירת־מחדל עבור כל הבקשות.
   */
  setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  /**
   * הסרת כותרת ברירת־מחדל.
   */
  removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  /**
   * הגדרת טוקן Authorization בסגנון Bearer לכל הבקשות.
   */
  setAuthToken(token: string): void {
    this.setHeader("Authorization", `Bearer ${token}`);
  }

  /**
   * ניקוי טוקן Authorization מהכותרות.
   */
  removeAuthToken(): void {
    this.removeHeader("Authorization");
  }

  /**
   * קבלת ה-instance של axios למקרי קצה מיוחדים.
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * מופע ברירת־מחדל של השירות לשימוש מהיר באפליקציה.
 */
const http = new HttpService({
  timeout: 60000,
});

export default http;

const endpoints = {
  users: "/users",
  pledges: "/pledges",
  donors: "/donors",
  projects: "/projects",
  donations: "/donations",
  expenses: "/expenses",
  uploads: "/uploads",
  jobs: "/jobs",
  cities: "/system-settings/cities",
  currencies: "/system-settings/currencies",
  systemSettings: "/system-settings",
  incomeSources: "/system-settings/income-sources",
  reports: "/reports",
};
/**
 * API wrapper – מחזיר data בלבד
 * יושב מעל HttpService ולא מחליף אותו
 */
const api = {
  get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return http.get<T>(endpoint, params, config).then((r) => r.data);
  },

  post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return http.post<T>(endpoint, data, config).then((r) => r.data);
  },

  put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return http.put<T>(endpoint, data, config).then((r) => r.data);
  },

  patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return http.patch<T>(endpoint, data, config).then((r) => r.data);
  },

  delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return http.delete<T>(endpoint, config).then((r) => r.data);
  },
};
export { HttpService, type HttpResponse, type HttpConfig, endpoints, api };
