import React,{useState, useContext, useCallback} from "react";

import {Button, Tooltip} from "antd";
import { AudioOutlined, AudioMutedOutlined, VideoCameraAddOutlined, VideoCameraOutlined, FullscreenOutlined, FullscreenExitOutlined} from '@ant-design/icons';

import ZoomVideo from "@zoom/videosdk";
import zoomContext from "../../context/zoom-context";
import MediaContext from "../../context/media-context";
import "./video.scss";

const VideoContainer = () => {
    const [videoStarted, setVideoStarted] =  useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const  [isSharescreen, setIsSharescreen] = useState(false);
    const [isSAB, setIsSAB] = useState(false);

    const client = useContext(zoomContext);
    const mediaStream = useContext(MediaContext);

    const participants = client.getAllUser()


    const isSupportingWebCodecs =  () => {
        return typeof window.MediaStreamTrackProcessor === 'function';
    }

    const startVideoButton = useCallback(async () => {

        if(!videoStarted){

            if(!!window.chrome && !(typeof SharedArrayBuffer === "function")) {

                setIsSAB(false);
                await mediaStream.startVideo({ videoElement: document.querySelector('#self-view-video')}).then(() => {
                    // show HTML Video element in DOM
                    document.querySelector('#self-view-video').style.display = 'block'
                 }).catch((error) => {
                   console.log(error)
                 })
                
            } else {
                setIsSAB(true)
                await mediaStream.startVideo();
                await mediaStream.renderVideo(document.querySelector('#self-view-canvas'), client.getCurrentUserInfo().userId,1920 , 1080, 0, 0, 3 ).then(() => {
                    // show HTML Canvas element in DOM
                    document.querySelector('#self-view-canvas').style.display = 'block'
                 }).catch((error) => {
                    console.log(error)
                 })
                
            }
            setVideoStarted(true);

        } else {

            await mediaStream.stopVideo();

            if(isSAB){
                mediaStream.stopRenderVideo(document.querySelector('#self-view-canvas'), client.getCurrentUserInfo().userId);
            }

            setVideoStarted(false);
        }

    }, [mediaStream, videoStarted, client, isSAB]);

    const startAudio = useCallback(async () => {
            
            if(!audioStarted){
                if(isMuted){
                    await mediaStream.unmuteAudio();
                    setIsMuted(false);
                }else {
                    await mediaStream.muteAudio();
                    setIsMuted(true);
                }
            } else {
    
                await mediaStream.startAudio();
                setAudioStarted();
            }
    
    }, [mediaStream, audioStarted,isMuted]);

    const startShareScreen = useCallback(async () => {
        if(!isSharescreen){
            await mediaStream.startShareScreen(document.querySelector('#share-video'))
          
            setIsSharescreen(true);
        } else {
            await mediaStream.startShareScreen(document.querySelector('share-canvas'))
        }
        setIsSharescreen(true);

    }, [mediaStream, isSharescreen]);

    function nextVideos() {

        // stop rendering the first 4 videos
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[0].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[1].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[2].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[3].userId)
      
        // render the next 4 videos
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[4].userId, 960, 540, 0, 540, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[5].userId, 960, 540, 960, 540, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[6].userId, 960, 540, 0, 0, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[7].userId, 960, 540, 960, 0, 2)
      }

      function previousVideos() {

        // stop rendering the first 4 videos
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[4].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[5].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[6].userId)
        mediaStream.stopRenderVideo(document.querySelector('#participant-videos-canvas'), participants[7].userId)
      
        // render the next 4 videos
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[0].userId, 960, 540, 0, 540, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[1].userId, 960, 540, 960, 540, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[2].userId, 960, 540, 0, 0, 2)
        mediaStream.renderVideo(document.querySelector('#participant-videos-canvas'), participants[3].userId, 960, 540, 960, 0, 2)
      }


    return (
        <div>

     <h1 > Zoom Video SDK Page</h1>

      {isSAB ? 
            
        <canvas id="participant-videos-canvas" width="1920" height="1080"></canvas>:<video id="self-view-video" width="1920" height="1080"></video>
        
        }

        {isSAB ? 
            
            <canvas id="self-view-canvas" width="1920" height="1080"></canvas>:
            <video id="self-view-video" width="1920" height="1080"></video>
        
        }

        { !isSupportingWebCodecs() ? 

        <canvas id="share-canvas" width="1920" height="1080"></canvas>:
        <video id="share-video" width="1920" height="1080"></video>
        }
        {/* Replace video and canvas with isSAB id to view buttons */}
    

        <div className="video-footer">
        
            <Tooltip title={ `${videoStarted ? 'Stop Video' : 'Start Video'}`}>
                <Button
                    className="video-control__button"
                    shape="circle"
                    size="large"
                    icon={videoStarted ? <VideoCameraAddOutlined /> : <VideoCameraOutlined />}
                    onClick={startVideoButton}
                />  
            </Tooltip>

            <Tooltip title={ `${!isSharescreen ? "Start" : "Stop"} Share Screen`}>

                <Button
                    className="video-control__button"
                    shape="circle"
                    size="large"
                    icon={isSharescreen ? <FullscreenOutlined /> : <FullscreenExitOutlined />}
                    onClick={startShareScreen}
                />
            </Tooltip>

            <Tooltip title={audioStarted ? isMuted ? "mute" : "unmute" : "Start Audio" }>

                <Button
                    className="video-control__button"
                    shape="circle"
                    size="large"
                    icon={audioStarted ? isMuted ? <AudioMutedOutlined /> : <AudioOutlined /> : <AudioOutlined />}
                    onClick={startAudio}
                
                />

            </Tooltip>



        </div>


        </div>
    )

}

export default VideoContainer;