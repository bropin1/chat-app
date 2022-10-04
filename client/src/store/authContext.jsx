import { createContext, useState } from "react";

export const AuthContext = createContext({
  authenticated: false,
  mySelf: "Mike",
  setAuthenticated: () => {},
  setMySelf: () => {},
});

export const AuthContextProvider = (props) => {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("authenticated")
      ? localStorage.getItem("authenticated")
      : false
  );
  const [mySelf, setMySelf] = useState(
    localStorage.getItem("mySelf")
      ? JSON.parse(localStorage.getItem("mySelf"))
      : { id: "", name: "" }
  );

  return (
    <AuthContext.Provider
      value={{ authenticated, mySelf, setAuthenticated, setMySelf }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
