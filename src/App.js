import React, { useState, useEffect } from "react";
import test_data from "./test_data.json"

// Phrases that trigger a search
const questionTriggers = ["can you tell me", "have you worked", "what is"];

function App() {
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (isListening) {
      handleSpeechRecognition();
    }
  }, [isListening]);

  const handleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("Listening...");
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript.toLowerCase();
      console.log("Transcript:", speechText);
      setTranscript(speechText);

      // Check if the speech starts with any of the trigger phrases
      const matchingTrigger = questionTriggers.find((trigger) =>
        speechText.startsWith(trigger)
      );

      if (matchingTrigger) {
        // Remove the trigger phrase from the speech and search the rest
        const query = speechText.replace(matchingTrigger, "").trim();
        console.log("Extracted Query:", query); // Debugging
        searchQuestion(query);
      } else {
        console.log("No question trigger detected.");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false); // Automatically stop listening after processing speech
    };

    recognition.start();
  };

  const searchQuestion = (input) => {
    console.log("Searching for:", input); // Debugging

    const results = test_data.filter(
      (item) =>
        item.question.toLowerCase().includes(input) ||
        item.answer.toLowerCase().includes(input)
    );

    setSearchResults(results);

    if (results.length === 0) {
      console.log("No matching results found."); // Debugging
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Interview Q&A Finder</h1>
      <button
        onClick={() => setIsListening(!isListening)}
        style={{
          backgroundColor: isListening ? "red" : "#007BFF",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <p>Transcript: <strong>{transcript}</strong></p>
      <h2>Results</h2>
      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((item, index) => (
            <li key={index}>
              <strong>Q:</strong> {item.question} <br />
              <strong>A:</strong> {item.answer}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching results found.</p>
      )}
    </div>
  );
}

export default App;
