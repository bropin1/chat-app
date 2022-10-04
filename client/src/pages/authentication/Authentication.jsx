import React, { Fragment, useRef, useContext, useEffect } from "react";
import style from "./Authentication.module.scss";
import { AuthContext } from "../../store/authContext";
import { useParams, useNavigate } from "react-router-dom";
import { baseUri } from "../../config";

const Authentication = () => {
  const { authenticated, setAuthenticated, setMySelf } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const username = useRef();
  const password = useRef();
  const { sign } = useParams();

  useEffect(() => {
    if (authenticated) navigate("/");
  }, [authenticated, navigate]);

  const authentication = (() => {
    if (sign === "signup") {
      return "signup";
    } else if (sign === "signin") {
      return "signin";
    } else {
      //can redirect to 404page with navigate
    }
  })(); // that works when i reload the page but does it work when reacts router sets routes

  console.log(".env", process.env.DEV_ENV);
  const loginHandler = async (e) => {
    //if you make a request make the handle async
    e.preventDefault();

    fetch(`${baseUri}users/auth/${sign}`, {
      method: "POST",
      mode: "cors",
      credientials: "include",

      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },

      body: JSON.stringify({
        name: username.current.value,
        password: password.current.value,
      }),
    })
      .then((res) => {
        console.log("res.ok", res.ok);
        if (res.ok) {
          setAuthenticated(true);
          const getOwnUser = async () => {
            const data = await res.json();
            setMySelf({ id: data._id, name: data.name }); //save my own user
            localStorage.setItem(
              "mySelf",
              JSON.stringify({ id: data._id, name: data.name })
            );
          };

          localStorage.setItem("authenticated", "true");
          let now = new Date().getTime();
          const creationTime = now;
          localStorage.setItem("creationTime", JSON.stringify(creationTime));

          //localStorage.removeItem('My-key)
          //localStorage.clear() remove all
          //save authentication to local Storage
          getOwnUser();
          navigate("/");
          //save the data to local storage
        }
      })
      .catch((err) => {
        alert(err);
      });

    //if fetch is successful we have cookie to pass to setAuthenticated
    // setAuthenticated(cookie) => if cookie exists, authenticated is true, else it's false.
    //navigate("/"); redirect to home after request ends.
  };

  return (
    <Fragment>
      <div className={style.container}>
        <form onSubmit={loginHandler} className={style.form}>
          <div className={style.wrapper}>
            <span>{authentication}</span>
            <input
              name="username"
              placeholder="username"
              ref={username}
              autoComplete="off"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="password"
              ref={password}
              autoComplete="off"
              required
            />
            <button type="submit">send</button>
          </div>
        </form>
      </div>
    </Fragment>
  );
};

export default Authentication;
