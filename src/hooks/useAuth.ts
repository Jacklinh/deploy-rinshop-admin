import { create } from "zustand";
import { axiosClient } from "../library/axiosClient";
import { devtools, persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware"; 
import { globalSetting } from "../constants/configs";
interface User {
  _id: string;
  fullName: string;
  phone: string;
  password: string;
  email: string,
  role: string[];
}
interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ isAuthenticated: boolean; error: string }>;
  logout: () => void;
}

const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        setUser: (user: User) => set({ user }),
        login: async (email: string, password: string) => {
          try {
            const response = await axiosClient.post(
              `${globalSetting.URL_API}/auth/login`,
              { email, password },
              {
                headers: {
                  'Content-Type': 'application/json',  // Đảm bảo gửi đúng kiểu dữ liệu
                }
              }
            );

            if (response && response.data.statusCode === 200) {
              const responseProfile = await axiosClient.get(
                `${globalSetting.URL_API}/auth/profile`
              );

              set({
                user: responseProfile.data.data,
                isAuthenticated: true,
              });

              return { isAuthenticated: true, error: "" };
            } else {
              return {
                isAuthenticated: false,
                error: "Username or password is invalid",
              };
            }
          } catch(error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
              const err = error as { response: { status: number } };
              if (err.response.status === 400) {
                alert('Email hoặc mật khẩu không đúng');
              } else {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
              }
            } else {
              alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
            }
            return {
              isAuthenticated: false,
              error: "Login failed",
            };
          }
        },
        logout: () => {
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        },
      }),
      {
        name: "auth-storage", // Tên của key lưu trữ
        storage: createJSONStorage(() => sessionStorage), // Lưu trữ trong sessionStorage (tuỳ chọn, mặc định là localStorage)
      }
    )
  )
);

export default useAuth;