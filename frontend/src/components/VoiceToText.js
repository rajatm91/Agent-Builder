import React, { useEffect, useRef, useState } from "react";
import { IconButton, TextField, Box, CircularProgress } from "@mui/material";
import { Mic } from "@mui/icons-material";

const VoiceToText = ({ onInputChange }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [permissionGranted, setPermissionGranted] = useState(false);
    const recognitionRef = useRef(null); // Use a ref to store the recognition object
  
    // Check microphone permissions
    useEffect(() => {
      const checkMicrophonePermission = async () => {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          setPermissionGranted(permissionStatus.state === 'granted');
  
          permissionStatus.onchange = () => {
            setPermissionGranted(permissionStatus.state === 'granted');
          };
        } catch (error) {
          console.error('Error checking microphone permission:', error);
        }
      };
  
      checkMicrophonePermission();
    }, []);
  
    // Initialize speech recognition
    const initializeRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
        return null;
      }
  
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US'; // Set language
  
      recognition.onstart = () => {
        setIsListening(true);
      };
  
      recognition.onend = () => {
        setIsListening(false);
      };
  
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        onInputChange(transcript); // Pass the transcript to the parent component
      };
  
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert('Microphone access is denied. Please allow microphone access in your browser settings.');
        } else {
          alert('Error occurred during speech recognition. Please try again.');
        }
      };
  
      return recognition;
    };
  
    // Request microphone access
    const requestMicrophoneAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        alert('Microphone access is required for voice-to-text functionality.');
      }
    };
  
    // Start/stop listening
    const toggleListening = async () => {
      if (!permissionGranted) {
        await requestMicrophoneAccess();
        return;
      }
  
      // Initialize recognition if not already initialized
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }
  
      if (!recognitionRef.current) {
        alert('Speech recognition is not available.');
        return;
      }
  
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    };
  

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <IconButton
        onClick={toggleListening}
        color={isListening ? "secondary" : "primary"}
        aria-label="start/stop listening"
      >
        {isListening ? <CircularProgress size={24} /> : <Mic />}
      </IconButton>
    </Box>
  );
};

export default VoiceToText;
