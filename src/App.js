import React, { Component } from "react";
import "./App.css";

import { Provider, connect } from "react-redux";
import { createStore } from "redux";

// simulating data objects stored on the backend:
const localhost = {
  "/video/0": { title: "Coffee in the Morning", src: "./videos/Coffee-in-the-Morning.mp4" },
  "/video/1": { title: "California Beach", src: "./videos/California-Beach.mp4" }
}

// console.log(localhost["/video/1"])

// simulate axios request to backend/ returns a promise with the data:
const axios = {
  get: function (url) {
    return new Promise(function (resolve, reject) {
      if (localhost[url]) {
        resolve(localhost[url])
      } else {
        reject({ message: "Could not locate the video." })
      }
    });
  }
}

// create an object to hold the initial state:
let initialState = {
  video: { title: "Coffee in the Morning", src: "./videos/Coffee-in-the-Morning.mp4" },
  isLoggedIn: false,
  videoIsLoading: false,
  videoError: null,
};

// reduce means to take different things and combine them into one thing.
//you are taking the previous state object and the properties that are on the action object, and putting them together on a new object and returning that new object.
let reducer = function (state = initialState, action) {
  // state object will be passed by the Provider and
  //action = {type: "ACTION_NAME"}
  switch (action.type) {
    case "VIDEO_LOADING":
      return {
        ...state,
        videoIsLoading: true,
        videoError: null
      };
    case "VIDEO_LOAD_SUCCESS":
      return {
        ...state,
        videoIsLoading: false,
        video: action.payload
      };
    case "VIDEO_LOAD_ERROR":
      return {
        ...state,
        videoIsLoading: false,
        video: null,
        videoError: action.error.message

      };
    default:
      return state;
  }
};

// the store is the place where your state is stored, and where the reducer function acts on it, in order to create a new state, when it is updated
// import { createStore } from "redux";
const store = createStore(reducer)


class Video extends Component {
  constructor(props) {
    super(props)
    this.changeVideo = this.changeVideo.bind(this)
  }

  changeVideo(url) {
    store.dispatch({ type: "VIDEO_LOADING" })
    setTimeout(function () {
      axios.get(url).then(function (response) {
        console.log("response:", response)
        store.dispatch({ type: "VIDEO_LOAD_SUCCESS", payload: response })
      }).catch(function (error) {
        console.log("error:", error)
        store.dispatch({ type: "VIDEO_LOAD_ERROR", error: error })
      });
    }, 2000)
  }
  render() {
    return (
      <div>
        <div>
          <h3>{this.props.video ? this.props.video.title : "no video loaded"}</h3>
          <div>{this.props.videoIsLoading ? "Next video is loading ..." : ""}</div>
          <video src={this.props.video ? this.props.video.src : ""} />
        </div>
        <button onClick={(e) => { this.changeVideo("/video/1") }}>load video with id: 1</button>
        <button onClick={(e) => { this.changeVideo("/video/0") }}>load video with id: 0</button>
        <button onClick={(e) => { this.changeVideo("/video/zonk") }}>load video with id that is not there</button>
      </div>
    );
  }
}
// 

// is this what lets you know which state properties you want on your props object?
// the Provider will pass the state to this fucntion
function mapStateToProps(state) {
  return {
    video: state.video,
    videoIsLoading: state.videoIsLoading
  };
}

// import { Provider, connect } from "react-redux";
// the video component will be passed to the Provider function in the Apps render method. The connect function will link the state in the Video component to the store in the Provider, that holds the state
Video = connect(mapStateToProps)(Video)


class App extends Component {
  render() {
    // import { Provider } from "react-redux";
    return (
      <Provider store={store}>
        <div className="App">
          <h1>Practice App</h1>
          <Video />
        </div>
      </Provider>
    );
  }


}

export default App;
