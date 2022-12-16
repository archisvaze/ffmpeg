import React, { useEffect, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: true })

const Main = () => {
    const [audio, setaudio] = useState("");
    const [watermark, setwatermark] = useState("");
    const [ffmpegState, setffmpegState] = useState({ ready: false, audio: null })

    const ffmpegInit = async () => {
        await ffmpeg.load();
        setffmpegState({ ...ffmpegState, ready: true })
    }

    useEffect(() => {
        ffmpegInit();
    }, [])

    const addAudioWatermark = async() => {

        //write audio to memory
        ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audio));
        ffmpeg.FS("writeFile", "watermark.mp3", await fetchFile(watermark));

        //run ffmpeg command
        await ffmpeg.run(
            "-i",
            "audio.mp3",
            "-i",
            "watermark.mp3",
            "-filter_complex",
            "amovie=watermark.mp3:loop=5[r];amovie=audio.mp3:loop=0[s];[r][s]amix=duration=shortest",
            "output.mp3"
        );

        const data = ffmpeg.FS("readFile", "output.mp3");
        const url = URL.createObjectURL(
            new Blob([data.buffer], {type: "audio"})
        )


        setffmpegState({ ...ffmpegState, audio: url })
    }

    return (
        <main>
            <h2>Main</h2>

            <audio controls src={audio}></audio>
            <input onChange={(e) => {
                let file = e.target.files[0];
                setaudio(URL.createObjectURL(file))
            }} type="file" />

            
            <input onChange={(e) => {
                 let file = e.target.files[0];
                 setwatermark(URL.createObjectURL(file))
            }} type="file" />

            <button onClick={() => {
                addAudioWatermark();
            }}>Add Watermark</button>

            {ffmpegState.audio && <audio controls src={ffmpegState.audio}></audio>}

        </main>
    );
};

export default Main;
