import React, {
  Fragment,
  useEffect,
  useContext,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../store/authContext";
import User from "../../components/userProfile/User.jsx";
import style from "./Home.module.scss";
import Chat from "../../components/chat/Chat.jsx";
import { baseUri, wsBaseUri } from "../../config";

const dummyUsersList = [
  {
    _id: "esqdfqsdf",
    name: "Frank",
    messages: [
      { sender: "Frank", message: "Hi" },
      { sender: "Mike", message: "Hi" },
    ],
  },
  {
    _id: "esqdf11qsdf",
    name: "Théodore",
    messages: [
      { sender: "Theodore", message: "Hi" },
      { sender: "Mike", message: "fuck off" },
    ],
  },
  {
    _id: "esq58dfqsdf",
    name: "Aladin",
    messages: [
      { sender: "Mike", message: "Hey" },
      { sender: "Aladin", message: "Why the fuck?" },
    ],
  },
];

const Home = () => {
  const [usersList, setUsersList] = useState(dummyUsersList); //fake usersList for now => to do the layout
  const navigate = useNavigate();
  const { authenticated, setAuthenticated, mySelf, setMySelf } =
    useContext(AuthContext);
  const [selectedConversation, setSelectedConversation] = useState([]); //useState
  const [chatRecipient, setChatRecipient] = useState({ name: "", id: "" }); //useState
  const [chatId, setChatId] = useState("");
  const [sendMessageHandler, setSendMessageHandler] = useState(
    () => (message, recipientId) => {}
  );
  const chatRef = useRef();
  const socket = new WebSocket(wsBaseUri);
  const initiateConnexion = () => {
    const socket = new WebSocket(wsBaseUri);
    socket.addEventListener("open", (e) => {
      const data = { initializing: true, message: null };
      socket.send(JSON.stringify(data));
    });

    socket.addEventListener("message", (res) => {
      const data = JSON.parse(res.data);
      let tempUsersList = usersList;
      for (let i = 0; i < tempUsersList.length; i++) {
        if (tempUsersList[i]._id === data.senderId) {
          tempUsersList[i].messages.push(data.message);
          tempUsersList[i].notification = true;
          setUsersList(tempUsersList);
          setSelectedConversation(
            JSON.parse(JSON.stringify(tempUsersList[i].messages))
          );
        }
      }
      //add the push conv here
      // do i add the send message to server here ? => no that is where you add the incomming messages dumass
    });
    socket.onclose = () => {
      setTimeout(initiateConnexion, 300);
    };
  };
  const clearLocalStorage = () => {
    const now = new Date().getTime();
    if (
      localStorage.getItem("creationTime") &&
      JSON.parse(localStorage.getItem("creationTime")) + 60 * 60 * 1000 < now
    ) {
      localStorage.clear();
      navigate("/signup");
    }
    setTimeout(clearLocalStorage, 1000 * 60 * 60);
  };
  clearLocalStorage();

  useEffect(() => {
    if (!authenticated) navigate("/auth/signup");

    //fetch user only once

    const fetchUsers = async () => {
      fetch(`${baseUri}users/findAll`, {
        method: "GET",
        mode: "cors",
        credientials: "include",
      })
        .then((res) => {
          const getData = async () => {
            const data = await res.json();
            for (let i = 0; i < data.length; i++) {
              if (data[i]._id === mySelf.id) data.splice(i, 1);
            }
            //---------------------------------------------------------------
            //add random profile picture
            const newData = [];
            data.map((obj) => {
              obj.profilePicture = require(`../../ressources/images/man${
                Math.round(Math.random() * 5) + 1
              }.jpg`);
              newData.push(obj);
            });
            // data = newData;
            //---------------------------------------------------------------
            setUsersList(newData);
            console.log(data);
          };
          getData();
        })
        .catch((err) => {
          console.log(err);
        });
    };
    // if (init) {
    fetchUsers();
    //making sure it only fetches the user once
    // }
  }, [mySelf, authenticated]);

  useEffect(() => {
    initiateConnexion(); //initializing websocket connection
    setSendMessageHandler(() => {
      return (message, recipientId) => {
        //push to client database
        let tempUsersList = usersList;
        console.log("message", message);
        console.log("usersList[0", usersList[0]);
        for (let i = 0; i < tempUsersList.length; i++) {
          if (tempUsersList[i]._id === recipientId) {
            tempUsersList[i].messages.push({ sender: mySelf.name, message });
            setUsersList(tempUsersList);
            setSelectedConversation(
              JSON.parse(JSON.stringify(tempUsersList[i].messages))
            );
          }
        }
        // need to check that the socket is still open create const isSocketOpen function
        socket.send(
          JSON.stringify({
            message: {
              sender: mySelf.name, //initializing non-defined is already false
              message,
            },
            recipientId,
          })
        );
      };
    });

    return () => {};
  }, [navigate, usersList]); //adding the socket to the dependency created a bug infinite loop maybe?

  const logoutHandler = (e) => {
    localStorage.removeItem("authenticated");
    setAuthenticated(false);
    localStorage.clear();
    //delete cookie
    //cannot delete a secure or httponly cookie from client has to be done in server
  };
  //need to fire this even when not clicking on the chat

  //rerendering chat component
  const focusChatHandler = (recipientName) => {
    if (usersList) {
      // console.log("UsersList", usersList);
      usersList.map((profile) => {
        if (profile.name === recipientName) {
          setSelectedConversation(JSON.parse(JSON.stringify(profile.messages)));
          console.log("selectedConversation", selectedConversation);
          setChatRecipient({ name: profile.name, id: profile._id });
          //get rid of notification
          let tempUsersList = usersList;
          for (let i = 0; i < tempUsersList.length; i++) {
            if (tempUsersList[i]._id === profile._id) {
              tempUsersList[i].notification = false;
              setUsersList(tempUsersList);
            }
          }
          //-------------------------
          setChatId(profile._id);
          console.log("chatId:", chatId);
        }
      });
    } //
  };

  const profiles = usersList ? (
    usersList.map((profile) => {
      return (
        <User
          key={profile._id}
          name={profile.name}
          image={profile.profilePicture}
          lastMessage={profile.messages[profile.messages.length - 1]}
          notification={profile.notification}
          focusHandler={focusChatHandler}
          focused={profile._id === chatRecipient.id ? true : false}
        />
      );
    })
  ) : (
    <User />
  );

  const defaultChat = (
    <div className={style.defaultChat}>Commence à discuter !</div>
  );
  return (
    <Fragment>
      <div className={style.home}>
        <div className={style.navbar}>
          <button onClick={logoutHandler}>LOG OUT</button>
        </div>
        <div className={style.flex}>
          <div className={style.profiles}> {profiles}</div>
          <div className={style.chat} ref={chatRef}>
            {chatId.length === 0 ? (
              defaultChat
            ) : (
              <Chat
                id={chatId} //id of the recipient not id of mySelf
                conversation={selectedConversation}
                name={chatRecipient.name}
                sendMessage={sendMessageHandler}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
