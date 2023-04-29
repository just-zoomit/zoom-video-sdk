import React, { useEffect,useContext } from "react";
import "./App.css";
import ZoomVideo from "@zoom/videosdk";
import axios from "axios";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import VideoContainer from "./Feature/Video/Video";
import Home from "./Feature/Home/Home";

import ZoomContext from "./context/zoom-context";
import MediaContext from "./context/media-context";


function App() {
  const [loading, setLoading] = React.useState(false);
  const [mediaStream, setMediaStream] = React.useState();
  const [status, setStatus] = React.useState(false);

  // Create Client
  // const client = ZoomVideo.createClient();
  const client = useContext( ZoomContext );

  useEffect(() => {
  const init = async () => {

    await client.init("en-US",'CDN');
    console.log("----Client Initialized----");

  
    try {

      // API Request
      const payload = {
        role: parseInt(1, 10),
        sessionName: "sessname40203037",
        sessionKey: "Session key",
        userIdentity: "donte.video.sdk@gmail.com",
        password: "abc123",
      };

      const data = await axios({
        method: "POST",
        url: "http://localhost:4000/sig",
        data: payload,
      })
        .then((res) => {
          console.log("----Signature----", res.data.signature);
          return res.data.signature;
        })
        .catch((err) => {
          console.log(err);
        });

        const token = data;

      // Join Session
      await client.join("sessname40203037", token , "user123", "abc123");
      console.log("----Client Joined----");
      const stream = client.getMediaStream();
      console.log("----Stream----", stream);
  
      setMediaStream(stream);
      
    } catch (error) {
      console.log("----Error----", error);
      
    }
  };

  // Initialize Client
  init();

  //Clean up function, destroy client
  return () => {
    ZoomVideo.destroyClient();
  };

}, [client]);

 

  return (
    <div className="App">
      {!loading && (
        <MediaContext.Provider value = {mediaStream}>
          <Router>
          <Switch>
         
          <Route path = "/video" component ={VideoContainer} />
          </Switch>
          </Router>
         </MediaContext.Provider>
      )}
    </div>
  );
}

export default App;
