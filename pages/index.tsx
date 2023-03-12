import { DefaultEventsMap } from "@socket.io/component-emitter";
import Head from "next/head";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import IssueIcon from "../components/icons/issue-icon";
import SearchIcon from "../components/icons/search-icon";
import InboxIcon from "../components/icons/inbox";
import MyIssue from "../components/icons/MyIssue";
import RoadmapIcon from "../components/icons/Roadmap";
import ViewIcon from "../components/icons/View";
import StarIcon from "../components/icons/Star";
import Todo from "../components/icons/todo";
import AddIcon from "../components/icons/Add";
import InprogressIcon from "../components/icons/Inprogress";
import DoneIcon from "../components/icons/Done";
import IndevReview from "../components/icons/Indevreview";
import User from "../components/icons/User";
import HomeIcon from "../components/icons/Home";
import CrossIcon from "../components/icons/Cross";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  ResponderProvided,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";

const server = "https://linear-server.onrender.com";
var socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const columnList = [
  { name: "Todo", icon: Todo, value: "TODO" },
  { name: "In Progress", icon: InprogressIcon, value: "INPROGRESS" },
  { name: "In Dev Review", icon: IndevReview, value: "IN_DEV_REVIEW" },
  { name: "Done", icon: DoneIcon, value: "DONE" },
];

export default function Home() {
  const [count, setCount] = useState(0);
  const [todo, setTodo] = useState<any>([]);
  const [inprogress, setInProgress] = useState<any>([]);
  const [indev, setIndev] = useState<any>([]);
  const [done, setDone] = useState<any>([]);
  const filterTicket = [todo, inprogress, indev, done];
  const [currentTicekt, setCurrentTicket] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "HIGH",
    issueId: "",
  });
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    fetchTicket();
    socket = io(server);
    socket.emit("current-team", "illusion-frontend");
    socket.on("recieved-update-ticket", ({ prevStatus, receiveData }) => {
      switch (prevStatus) {
        case "TODO": {
          setTodo((prev: []) =>
            prev.filter((el: any) => el._id != receiveData._id)
          );
          break;
        }
        case "INPROGRESS": {
          setInProgress((prev: []) =>
            prev.filter((el: any) => el._id != receiveData._id)
          );
          break;
        }
        case "IN_DEV_REVIEW": {
          setIndev((prev: []) =>
            prev.filter((el: any) => el._id != receiveData._id)
          );
          break;
        }
        case "DONE": {
          setDone((prev: []) =>
            prev.filter((el: any) => el._id != receiveData._id)
          );
          break;
        }
      }
      switch (receiveData.status) {
        case "TODO": {
          if (!todo.find((el: any) => el._id == receiveData._id)) {
            setTodo((prev: []) => [receiveData, ...prev]);
          }
          break;
        }
        case "INPROGRESS": {
          if (!inprogress.find((el: any) => el._id == receiveData._id)) {
            setInProgress((prev: any) => [receiveData, ...prev]);
          }
          break;
        }
        case "IN_DEV_REVIEW": {
          if (!indev.find((el: any) => el._id == receiveData._id)) {
            setIndev((prev: any) => [receiveData, ...prev]);
          }
          break;
        }
        case "DONE": {
          if (!done.find((el: any) => el._id == receiveData._id)) {
            setDone((prev: any) => [receiveData, ...prev]);
          }
          break;
        }
      }
    });
    socket.on("recieved-ticket", (receiveData) => {
      switch (receiveData.status) {
        case "TODO": {
          setTodo((prev: any) => [receiveData, ...prev]);
          break;
        }
        case "INPROGRESS": {
          setInProgress((prev: any) => [receiveData, ...prev]);
          break;
        }
        case "IN_DEV_REVIEW": {
          setIndev((prev: any) => [receiveData, ...prev]);
          break;
        }
        case "DONE": {
          setDone((prev: any) => [receiveData, ...prev]);
          break;
        }
      }
    });
  }, []);
  const handleChange = (e: any) => {
    setCurrentTicket({ ...currentTicekt, [e.target.name]: e.target.value });
  };
  const fetchTicket = async () => {
    try {
      let data: any = await axios.get(
        "https://linear-server.onrender.com/ticket"
      );
      data.data = data.data.reverse();
      let todo = [];
      let inprogress = [];
      let indev = [];
      let done = [];
      for (let i = 0; i < data.data.length; i++) {
        let status = data.data[i].status;
        switch (status) {
          case "TODO":
            todo.push(data.data[i]);
            break;
          case "INPROGRESS":
            inprogress.push(data.data[i]);
            break;
          case "IN_DEV_REVIEW":
            indev.push(data.data[i]);
            break;
          case "DONE":
            done.push(data.data[i]);
            break;
        }
      }
      setTodo(todo);
      setInProgress(inprogress);
      setIndev(indev);
      setDone(done);
      setCount(data.data.length);
    } catch (error) {
      console.log(error);
    }
  };
  const createTicket = async () => {
    currentTicekt.issueId = `YR-${count + 1}`;
    try {
      axios
        .post("https://linear-server.onrender.com/ticket", currentTicekt)
        .then((data) => {
          socket.emit("create-ticket", data.data);
          switch (data.data.status) {
            case "TODO": {
              setTodo((prev: any) => [data.data, ...prev]);
              break;
            }
            case "INPROGRESS": {
              setInProgress((prev: any) => [data.data, ...prev]);
              break;
            }
            case "IN_DEV_REVIEW": {
              setIndev((prev: any) => [data.data, ...prev]);
              break;
            }
            case "DONE": {
              setDone((prev: any) => [data.data, ...prev]);
              break;
            }
          }
        });
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateTicket = async (e: any, prevStatus: any) => {
    if (prevStatus == e.target.value) return;
    axios
      .patch(`https://linear-server.onrender.com/ticket/${prevStatus._id}`, {
        status: e.target.value,
      })
      .then((data) => {
        socket.emit("update-ticket", {
          prevStatus: e.target.value,
          receiveData: data.data,
        });
      });
    let updateObj = {};
    switch (prevStatus.status) {
      case "TODO": {
        let filetArra = [];
        for (let i = 0; i < todo.length; i++) {
          if (todo[i]._id == prevStatus._id) {
            todo[i].status = e.target.value;
            updateObj = todo[i];
          } else {
            filetArra.push(todo[i]);
          }
        }
        setTodo(filetArra);
        break;
      }
      case "INPROGRESS": {
        let filetArra = [];
        for (let i = 0; i < inprogress.length; i++) {
          if (inprogress[i]._id == prevStatus._id) {
            inprogress[i].status = e.target.value;
            updateObj = inprogress[i];
          } else {
            filetArra.push(inprogress[i]);
          }
        }
        setInProgress(filetArra);
        break;
      }
      case "IN_DEV_REVIEW": {
        let filetArra = [];
        for (let i = 0; i < indev.length; i++) {
          if (indev[i]._id == prevStatus._id) {
            indev[i].status = e.target.value;
            updateObj = indev[i];
          } else {
            filetArra.push(indev[i]);
          }
        }
        setIndev(filetArra);
        break;
      }
      case "DONE": {
        let filetArra = [];
        for (let i = 0; i < done.length; i++) {
          if (done[i]._id == prevStatus._id) {
            done[i].status = e.target.value;
            updateObj = done[i];
          } else {
            filetArra.push(done[i]);
          }
        }
        setDone(filetArra);
        break;
      }
    }

    switch (e.target.value) {
      case "TODO": {
        setTodo((prev: any) => [updateObj, ...prev]);
        break;
      }
      case "INPROGRESS": {
        setInProgress((prev: any) => [updateObj, ...prev]);
        break;
      }
      case "IN_DEV_REVIEW": {
        setIndev((prev: any) => [updateObj, ...prev]);
        break;
      }
      case "DONE": {
        setDone((prev: any) => [updateObj, ...prev]);
        break;
      }
    }
  };
  const reorder = (list: [], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (
    { source, destination, draggableId }: DropResult,
    provided: ResponderProvided
  ) => {
    if (!source || !destination) return;
    if (source.droppableId == destination.droppableId) {
      if (source.index == destination.index) return;
      switch (source.droppableId) {
        case "TODO": {
          setTodo((prevDone: []) =>
            reorder(prevDone, source.index, destination.index)
          );
          break;
        }
        case "INPROGRESS": {
          setInProgress((prevDone: []) =>
            reorder(prevDone, source.index, destination.index)
          );

          break;
        }
        case "IN_DEV_REVIEW": {
          setIndev((prevDone: []) =>
            reorder(prevDone, source.index, destination.index)
          );
          break;
        }
        case "DONE": {
          setDone((prevDone: []) =>
            reorder(prevDone, source.index, destination.index)
          );
          break;
        }
      }
    } else {
      let issue;
      switch (source.droppableId) {
        case "TODO": {
          let sourceList = [...todo];
          issue = sourceList.splice(source.index, 1)[0];
          issue.status = destination.droppableId;
          setTodo(sourceList);
          break;
        }
        case "INPROGRESS": {
          let sourceList = [...inprogress];
          issue = sourceList.splice(source.index, 1)[0];
          issue.status = destination.droppableId;
          setInProgress(sourceList);
          break;
        }
        case "IN_DEV_REVIEW": {
          let sourceList = [...indev];
          issue = sourceList.splice(source.index, 1)[0];
          issue.status = destination.droppableId;
          setIndev(sourceList);
          break;
        }
        case "DONE": {
          let sourceList = [...done];
          issue = sourceList.splice(source.index, 1)[0];
          issue.status = destination.droppableId;
          setDone(sourceList);
          break;
        }
      }
      switch (destination.droppableId) {
        case "TODO": {
          const destList = [...todo];
          destList.splice(destination.index, 0, issue);
          setTodo(destList);
          break;
        }
        case "INPROGRESS": {
          const destList = [...inprogress];
          destList.splice(destination.index, 0, issue);
          setInProgress(destList);
          break;
        }
        case "IN_DEV_REVIEW": {
          const destList = [...indev];
          destList.splice(destination.index, 0, issue);
          setIndev(destList);
          break;
        }
        case "DONE": {
          const destList = [...done];
          destList.splice(destination.index, 0, issue);
          setDone(destList);
          break;
        }
      }
      axios
        .patch(`https://linear-server.onrender.com/ticket/${issue._id}`, {
          status: destination.droppableId,
        })
        .then((data) => {
          socket.emit("update-ticket", {
            prevStatus: source.droppableId,
            receiveData: data.data,
          });
        });
    }
  };
  return (
    <>
      <Head>
        <title>Linear</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="home-container">
          <div className="nav-bar">
            <div className="profile">
              <div className="avatar-cont">
                <div className="avatar">IL</div>
                <div className="org">ILLUSION</div>
              </div>
              <div className="user_profile">YR</div>
            </div>
            <div className="issue-search">
              <div
                className="create-issue"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <IssueIcon />
                <div>New Issue</div>
              </div>
              <div className="search">
                <SearchIcon />
              </div>
            </div>
            <div className="feature">
              <div>
                <InboxIcon />
                Inbox
              </div>
              <div>
                <MyIssue />
                My Issues
              </div>
              <div>
                <ViewIcon />
                Views
              </div>
              <div>
                <RoadmapIcon />
                Roadmaps
              </div>
            </div>
          </div>
          <div className="ticket-cont">
            <div className="top-nav">
              <div>All Issues</div>
              <StarIcon />
              <div className="filter">
                <span>+ </span>
                Filter
              </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="ticket-cont1">
                {columnList.map((el, i) => (
                  <div key={el.value} className="list-cont">
                    <div className="ticket-col">
                      <div className="status-bar">
                        <div>
                          <el.icon />
                          <div>{el.name}</div>
                          <div>{filterTicket[i].length}</div>
                        </div>
                        <AddIcon />
                      </div>
                      <Droppable droppableId={el.value} key={i} type="category">
                        {(provided: DroppableProvided) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="ticket-scroll"
                            >
                              {filterTicket[i]?.map((el: any, i: number) => (
                                <Draggable
                                  draggableId={el._id}
                                  key={el._id}
                                  index={i}
                                >
                                  {(
                                    provided: DraggableProvided,
                                    snapshot: DraggableStateSnapshot
                                  ) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="ticket"
                                      >
                                        <div>
                                          <div>{el.issueId}</div>
                                          <User />
                                        </div>
                                        <div className="title">{el.title}</div>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          );
                        }}
                      </Droppable>
                    </div>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
        {showModal ? (
          <div className="create-ticket">
            <div className="head">
              <div>
                <HomeIcon />
                <div className="head-c">ILL</div>
                <span>New Issue</span>
              </div>
              <div
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <CrossIcon />
              </div>
            </div>
            <div>
              <input
                name="title"
                className="issuetitile"
                value={currentTicekt.title}
                onChange={handleChange}
                type="text"
                placeholder="Issue title"
              />
              <input
                className="issuetitile desc"
                name="description"
                type="text"
                onChange={handleChange}
                value={currentTicekt.description}
                placeholder="Add description..."
              />
            </div>
            <div className="status-priority">
              <select
                onChange={handleChange}
                name="status"
                className="status-select"
              >
                <option selected={true} value="TODO">
                  Todo
                </option>
                <option value="INPROGRESS">In Progress</option>
                <option value="IN_DEV_REVIEW">In Dev Review</option>
                <option value="DONE">Done</option>
              </select>
              <select
                className="status-select"
                onChange={handleChange}
                name="priority"
              >
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
            <div className="create-button-cont">
              <button onClick={createTicket}>Create issue</button>
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
    </>
  );
}
