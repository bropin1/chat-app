import React, { Fragment, useContext, useRef, useEffect } from "react";
import style from "./Chat.module.scss";
import { AuthContext } from "../../store/authContext";

const Chat = (props) => {
  const scrollRef = useRef();
  useEffect(() => {
    scrollRef.current.scroll(0, scrollRef.current.scrollHeight);
  }, [props]);
  const { mySelf } = useContext(AuthContext);
  const inputRef = useRef();
  const onSubmitHandler = (e) => {
    e.preventDefault();
    props.sendMessage(inputRef.current.value, props.id);
    inputRef.current.value = "";
  };

  return (
    <Fragment>
      <div className={style.wrapper}>
        <div className={style.header}>{props.name}</div>
        <div className={style.chat} ref={scrollRef}>
          {/* {typeof props.conversation} */}
          {props.conversation
            ? props.conversation.map((message) => {
                if (message.sender === mySelf.name) {
                  return (
                    <div className={style.right} key={Math.random()}>
                      <span className={style.message}>{message.message}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className={style.left} key={Math.random()}>
                      <div className={style.message}>{message.message}</div>
                    </div>
                  );
                }
              })
            : "Start a conversation"}
        </div>
        <div className={style.sendMessage}>
          <form onSubmit={onSubmitHandler}>
            <input type="message" ref={inputRef} />
            <button type="submit">
              <svg viewBox="0 0 512.662 512.662">
                <g>
                  <g>
                    <path
                      d="M505.021,5.868c-0.064-0.043-0.085-0.107-0.128-0.149c-0.128-0.107-0.256-0.128-0.384-0.235
			c-1.131-0.981-2.475-1.621-3.797-2.325c-0.427-0.213-0.747-0.576-1.195-0.768c-0.064-0.021-0.107-0.021-0.149-0.043
			c-0.469-0.192-0.853-0.533-1.323-0.704c-1.771-0.661-3.648-0.875-5.547-1.045c-0.576-0.043-1.131-0.299-1.707-0.299
			c-2.475-0.021-4.971,0.384-7.403,1.259L14.055,172.225c-7.445,2.709-12.779,9.323-13.867,17.173
			c-1.045,7.851,2.304,15.637,8.768,20.245l141.888,101.355l20.032,140.309c1.237,8.533,7.488,15.488,15.851,17.643
			c1.749,0.448,3.541,0.661,5.291,0.661c6.592,0,12.971-3.072,17.045-8.533l50.347-67.093l132.032,113.237
			c3.947,3.371,8.875,5.141,13.909,5.141c2.389,0,4.779-0.405,7.125-1.216c7.168-2.56,12.48-8.768,13.845-16.277l85.995-468.928
			C513.725,18.262,510.738,10.71,505.021,5.868z M240.125,348.396l-1.536,2.219l-32.747,43.669l-12.395-86.827l185.109-160.448
			L240.125,348.396z"
                    />
                  </g>
                </g>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Chat;
