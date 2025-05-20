import { create } from "zustand";

const useAppStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  theme: JSON.parse(localStorage.getItem("darkMode")) || false, // or 'dark'

  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setUser: (userData) => set({ user: userData }),
  setTheme: (theme) => set({ theme }),
}));

export default useAppStore;
