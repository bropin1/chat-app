import React, { Fragment, useRef } from "react";
import { useEffect } from "react";
import style from "./User.module.scss";

const User = (props) => {
  const man = require(`../../ressources/images/man${
    Math.round(Math.random() * 5) + 1
  }.jpg`);
  const profileRef = useRef();
  const notificationRef = useRef();
  // const woman = require(`../../ressources/images/woman${
  //   Math.round(Math.random() * 7) + 1
  // }.jpg`);
  const onEnterHandler = (e) => {
    if (!props.focused) profileRef.current.style.backgroundColor = "#d5d5d5";
  };
  const onLeaveHandler = (e) => {
    if (!props.focused)
      profileRef.current.style.backgroundColor = "var(--white)";
  };

  useEffect(() => {
    if (props.notification && !props.focused) {
      notificationRef.current.style.display = "flex";
    } else {
      notificationRef.current.style.display = "none";
    }
    if (props.focused) {
      profileRef.current.style.backgroundColor = "var(--focused-color)";
    } else if (!props.focused) {
      profileRef.current.style.backgroundColor = "var(--white)";
    }
  });

  const onClickHandler = () => {
    props.focusHandler(props.name);
  };
  return (
    <Fragment>
      <div
        className={style.profile}
        onClick={onClickHandler}
        onMouseEnter={onEnterHandler}
        onMouseLeave={onLeaveHandler}
        ref={profileRef}
        tabIndex={0}
      >
        <div className={style.icon}>
          <img src={props.image} />
        </div>
        <div className={style.wrapper}>
          <span>{props.name}</span>
        </div>

        <div className={style.notificationWrapper} ref={notificationRef}>
          <div className={style.notificationDot} />
        </div>
      </div>
    </Fragment>
  );
};

export default User;
