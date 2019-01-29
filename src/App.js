import React, { Component } from "react";
import "./App.css";

import { Provider, connect } from "react-redux";
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import thunk from 'redux-thunk'
import PropTypes from 'prop-types';


// simulating data objects stored on the backend:
const localhost = {
  "/video/0": { title: "Coffee in the Morning", src: "./videos/Coffee-in-the-Morning.mp4" },
  "/video/1": { title: "California Beach", src: "./videos/California-Beach.mp4" }
}


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


// TYPES: These consts will eventually replace the strings in the reducer, so that you don't accidentally name two different actions the same thing and debugging:

const actionTypes = {
  VIDEO_LOADING: "VIDEO_LOADING"
}

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
    case "LOAD_VIDEO_SUCCESS":
      // console.log("VIDEO SUCCESS in reducer")
      return {
        ...state,
        videoIsLoading: false,
        video: action.payload,
        videoError: null
      };
    // store.dispatch({ type: "VIDEO_LOAD_ERROR", error: { message: "cant find video" } })
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
// import {combineReducers } from "redux";
// const allReducers = combineReducers({ reducer: reducer });

// PUT ALL THIS IN THE store.js and simply export the finished store:
// the store is the place where your state is stored, and where the reducer function acts on it, in order to create a new state, when it is updated
// import { createStore } from "redux";
// import { applyMiddleware } from "redux";
// import { compose } from "redux";
// import thunk from 'redux-thunk'
// not sure why you use thunk. I though it was so that store would respond to async dispatches, but app seems to do that without it.
const middleware = [thunk];
const store = createStore(reducer, initialState, compose(applyMiddleware(...middleware), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()))


class Video extends Component {
  constructor(props) {
    super(props)
    this.changeVideo = this.changeVideo.bind(this)

  }

  changeVideo(url) {
    this.props.loadVideoAsync(url)
    // to look at async functionality, uncomment next line && comment-out line above.
    // this.props.loadVideoSync(url)
  }
  render() {
    return (
      <div>
        <div>
          <h3>{this.props.videoError ? this.props.videoError : ""}</h3>
          <div>{this.props.videoIsLoading ? "Next video is loading ..." : ""}</div>
          <video src={this.props.video ? this.props.video.src : ""} controls />
        </div>
        {/* hard-coding for now, but eventually get info from the event object that the dom will pass to the event listener */}
        <button onClick={(event) => { this.changeVideo("/video/1") }}>load video with id: 1</button>
        <button onClick={(event) => { this.changeVideo("/video/0") }}>load video with id: 0</button>
        <button onClick={(event) => { this.changeVideo("/video/zonk") }}>load video with id that is not there</button>
      </div>
    );
  }
}

// is this what lets you know which state properties you want on your props object?
// the Provider will pass the state to this fucntion
function mapStateToProps(state) {
  return {
    video: state.video,
    videoIsLoading: state.videoIsLoading,
    videoError: state.videoError
  };
}

// these functions simply return an object
const actionCreators = {
  loadVideoSuccess: function (url) {
    // logic to format action
    return {
      type: "LOAD_VIDEO_SUCCESS",
      payload: localhost[url]
    }
  },
  loadVideoError: function () {
    // logic to format action
    return {
      type: "VIDEO_LOAD_ERROR", error: { message: "cant find video" }
    }
  }, loadVideoAsync: function (url) {
    console.log("URL:", url)
  }


}
function matchDispatchToProps(dispatch) {
  return {
    loadVideoSync: function (url) {
      if (localhost[url]) {
        dispatch(actionCreators.loadVideoSuccess(url))
      } else {
        dispatch(actionCreators.loadVideoError())
      }
    },
    loadVideoAsync: function (url) {
      dispatch({ type: "VIDEO_LOADING" })
      setTimeout(function () {
        axios.get(url).then(response => {
          console.log("RESPONSE:", response)
          dispatch(actionCreators.loadVideoSuccess(url))
        }).catch(error => {
          console.log("ERROR:", error)
          dispatch(actionCreators.loadVideoError())
        })
      }, 2000);
    }
  }
}

// import { Provider, connect } from "react-redux";
// the video component will be passed to the Provider function in the Apps render method. The connect function will link the state in the Video component to the store in the Provider, that holds the state
Video = connect(mapStateToProps, matchDispatchToProps)(Video)

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
