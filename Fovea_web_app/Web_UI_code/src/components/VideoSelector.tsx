import { Video } from "lucide-react";
import { ChangeEvent, FC, memo, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import Crosshair from "./Crosshair";

interface VideoSelectorProps {
    onFileChange: (file: File) => void;
    onSelected: (selected: boolean) => void;
    reset: boolean;
}

const VideoSelector: FC<VideoSelectorProps> = memo((props) => {
    const [selected, setSelected] = useState<boolean>(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [countDown, setCountDown] = useState<number>(0);
    const [recordingStarted, setRecordingStarted] = useState<boolean>(false);

    const videoFeedRef = useRef<HTMLVideoElement>(null);
    const videoFeedInitiated = useRef<boolean>(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (props.reset) {
            setVideoFile(null);
            setCountDown(0);
            setRecordingStarted(false);
            setSelected(false);
            videoFeedInitiated.current = false; // Reset video feed initiation flag
        }
    }, [props.reset]);

    useEffect(() => {
        if (selected) {
            initCamera();
        }
    }, [selected]);

    const initCamera = async () => {
        if (videoFeedInitiated.current) return;
        videoFeedInitiated.current = true;
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                aspectRatio: 3 / 4,
            },
            audio: false,
        });
        if (videoFeedRef.current) {
            videoFeedRef.current.srcObject = stream;
        }
    };

    useEffect(() => {
        if (countDown === 0 && recordingStarted && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            videoFeedInitiated.current = false;
            setRecordingStarted(false);
        } else if (countDown > 0) {
            const timer = setTimeout(() => {
                setCountDown(countDown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countDown, recordingStarted]);

    const handleClickCheckBox = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.checked);
        setSelected(e.target.checked);
        props.onSelected(e.target.checked);
        if (e.target.checked) {
            initCamera();
        } else {
            videoFeedInitiated.current = false; // Reset video feed initiation flag when deselected
        }
    };

    const handleClick = () => {
        const select = !selected;
        setSelected(select);
        props.onSelected(select);
        if (select) {
            initCamera();
        } else {
            videoFeedInitiated.current = false; // Reset video feed initiation flag when deselected
        }
    };

    const handleButtonClick = () => {
        // record video
        if (videoFeedRef.current && !recordingStarted) {
            setRecordingStarted(true);
            const stream = videoFeedRef.current.srcObject as MediaStream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/mp4" });
                const file = new File([blob], "video.mp4", {
                    type: "video/mp4",
                });
                setVideoFile(file);
                props.onFileChange(file);
                setSelected(false);
                props.onSelected(false);
                setRecordingStarted(false);
            };

            mediaRecorder.start();
            setCountDown(10);
        }
    };

    return (
        <div className="h-full w-full">
            {selected ? (
                <div className="h-full w-full relative">
                    {recordingStarted ? (
                        <div className="flex flex-row w-full justify-center items-center space-x-10">
                            <div className="h-5 w-5 bg-red-800 rounded-full"></div>
                            <div className="space-x-2 flex flex-row">
                                <p className="text-4xl">{countDown}</p>
                                <p className="text-4xl">/</p>
                                <p className="text-4xl">10s</p>
                            </div>
                        </div>
                    ) : null}
                    <video
                        ref={videoFeedRef}
                        className="h-full w-full relative"
                        autoPlay
                    />
                    <Crosshair
                        onButtonClicked={handleButtonClick}
                        buttonEnabled
                    />
                </div>
            ) : null}
            {videoFile != null ? (
                <div className="h-full">
                    <video
                        src={URL.createObjectURL(videoFile)}
                        className="h-full w-full object-cover"
                        onClick={handleClick}
                        autoPlay
                        loop
                    />
                    <Input
                        type="checkbox"
                        className="hidden"
                        checked={selected}
                        onChange={handleClickCheckBox}
                    />
                </div>
            ) : (
                <div className="h-full">
                    <div className="h-11/12 bg-slate-50 border-slate-300 border-dashed border-4 flex items-center justify-center">
                        <Video
                            size={50}
                            className="text-slate-400"
                            onClick={handleClick}
                        />
                        <Input
                            type="checkbox"
                            className="hidden"
                            checked={selected}
                            onChange={handleClickCheckBox}
                        />
                    </div>
                    <p className="h-1/12 text-2xl text-center italic font-semibold">
                        Prenez une vidéo pour la reconnaissance automatique du
                        produit
                    </p>
                </div>
            )}
        </div>
    );
});

export default VideoSelector;
