import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import React, { useRef, useEffect, useState } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const LS_NAME = 'audioMessageRate';

const useStyles = makeStyles((theme) => ({
  audioWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%"
  },
  audioRow: {
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  transcriptionContainer: {
    marginTop: 10,
    padding: "10px 14px",
    backgroundColor: theme.mode === 'light' ? "#e8f5e9" : "#1b2b1e",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Roboto Mono', 'Source Code Pro', 'Courier New', monospace",
    fontWeight: 400,
    letterSpacing: "0.5px",
    color: theme.mode === 'light' ? "#2e7d32" : "#81c784",
    maxWidth: "100%",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    border: theme.mode === 'light' ? "1px solid #c8e6c9" : "1px solid #2e7d32",
    position: "relative",
    "&::before": {
      content: "'🤖 IA Transcrição:'",
      display: "block",
      fontSize: 11,
      fontWeight: 600,
      marginBottom: 6,
      color: theme.mode === 'light' ? "#388e3c" : "#66bb6a",
      fontFamily: "'Roboto', sans-serif",
      textTransform: "uppercase",
      letterSpacing: "1px"
    }
  },
  transcribeButton: {
    marginTop: 10,
    fontSize: 12,
    textTransform: "none",
    backgroundColor: "#4CAF50",
    color: "#ffffff",
    borderRadius: 20,
    padding: "6px 16px",
    border: "none",
    display: "block",
    "&:hover": {
      backgroundColor: "#45a049"
    },
    "&:disabled": {
      backgroundColor: "#81C784",
      color: "#ffffff"
    }
  }
}));

const AudioModal = ({ url, messageId, initialTranscription }) => {
  const classes = useStyles();
  const audioRef = useRef(null);
  const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
  const [showButtonRate, setShowButtonRate] = useState(false);
  const [transcription, setTranscription] = useState(initialTranscription || null);
  const [loadingTranscription, setLoadingTranscription] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioRate;
    }
    localStorage.setItem(LS_NAME, audioRate);
  }, [audioRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplaying = () => {
        setShowButtonRate(true);
      };
      audioRef.current.onpause = () => {
        setShowButtonRate(false);
      };
      audioRef.current.onended = () => {
        setShowButtonRate(false);
      };
    }
  }, []);

  useEffect(() => {
    // Update transcription if it comes from props (e.g., socket update)
    if (initialTranscription && !transcription) {
      setTranscription(initialTranscription);
    }
  }, [initialTranscription]);

  const toggleRate = () => {
    let newRate = null;

    switch (audioRate) {
      case 0.5:
        newRate = 1;
        break;
      case 1:
        newRate = 1.5;
        break;
      case 1.5:
        newRate = 2;
        break;
      case 2:
        newRate = 0.5;
        break;
      default:
        newRate = 1;
        break;
    }

    setAudioRate(newRate);
  };

  const handleTranscribe = async () => {
    if (transcription || !messageId) return;

    setLoadingTranscription(true);
    try {
      const { data } = await api.post(`/messages/${messageId}/transcribe`);
      setTranscription(data.transcription);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingTranscription(false);
    }
  };

  const getAudioSource = () => {
    let sourceUrl = url;

    if (isIOS) {
      sourceUrl = sourceUrl.replace(".ogg", ".mp3");
    }

    return (
      <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />
    );
  };

  return (
    <div className={classes.audioWrapper}>
      <div className={classes.audioRow}>
        <audio ref={audioRef} controls>
          {getAudioSource()}
        </audio>
        {showButtonRate && (
          <Button
            style={{ marginLeft: "5px" }}
            onClick={toggleRate}
          >
            {audioRate}x
          </Button>
        )}
      </div>

      {/* Transcription Section - Below Audio */}
      {messageId && (
        <>
          {transcription ? (
            <div className={classes.transcriptionContainer}>
              {transcription}
            </div>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={handleTranscribe}
              disabled={loadingTranscription}
              className={classes.transcribeButton}
            >
              {loadingTranscription ? (
                <>
                  <CircularProgress size={16} style={{ marginRight: 8, color: "#ffffff" }} />
                  Transcrevendo...
                </>
              ) : (
                "Transcrever Áudio"
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default AudioModal;