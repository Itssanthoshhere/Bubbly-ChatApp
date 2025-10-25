import { login, register } from "@/services/authService";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { useRouter } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { connectSocket, disconnectSocket } from "@/socket/socket";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  useEffect(() => {
    // On mount, check for token in storage
    loadToken();
  }, []);

  // Load token from AsyncStorage
  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);

        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          // Token has expired, navigate to welcome page
          await AsyncStorage.removeItem("token");
          gotoWelcomePage();
          return;
        }

        // User is logged in
        setToken(storedToken);
        await connectSocket();
        setUser(decoded.user);
        gotoHomePage();
      } catch (error) {
        gotoWelcomePage();
        console.log("Error decoding token: ", error);
      }
    } else {
      gotoWelcomePage();
    }
  };

  const gotoHomePage = () => {
    // wait is only for showing splash screen
    setTimeout(() => {
      router.replace("/(main)/home");
    }, 1500);
  };

  const gotoWelcomePage = () => {
    // wait is only for showing splash screen
    setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 1500);
  };

  const updateToken = async (token: string) => {
    if (token) {
      setToken(token);
      await AsyncStorage.setItem("token", token);

      // Decode user from token
      const decoded = jwtDecode<DecodedTokenProps>(token);
      console.log("Decoded Token: ", decoded);
      setUser(decoded.user);
    }
  };

  // Auth actions
  // -> Sign In
  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);

    await updateToken(response.token);

    await connectSocket();

    router.replace("/(main)/home");
  };

  // -> Sign Up
  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null
  ) => {
    const response = await register(email, password, name, avatar);

    await updateToken(response.token);

    await connectSocket();

    router.replace("/(main)/home");
  };

  // -> Sign Out
  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");

    disconnectSocket();

    router.replace("/(auth)/welcome");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, signIn, signUp, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
