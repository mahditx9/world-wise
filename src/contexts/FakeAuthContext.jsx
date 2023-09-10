/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const initial = {
  user: null,
  isAuthenticated: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...state, user: null, isAuthenticated: false };
    default:
      throw new Error("UNKNOWN ACTION!");
  }
};
const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100?u=zz",
};

const AuthContextProvider = ({ children }) => {
  const [{ user, isAuthenticated }, dispatch] = useReducer(reducer, initial);
  const handleLogin = (email, password) => {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({ type: "login", payload: FAKE_USER });
    }
  };
  const handleLogout = () => {
    dispatch({ type: "logout" });
  };
  const value = { user, isAuthenticated, handleLogin, handleLogout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuthCtx = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("Context used outside of provider");
  }
  return context;
};

export { AuthContextProvider, useAuthCtx };
