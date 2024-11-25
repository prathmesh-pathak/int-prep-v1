import React, { useState, useEffect } from "react";
import test_data from "./test_data.json";

const questionTriggers = ["can you tell me", "have you worked", "what is", "tell me"];

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  buttonActive: {
    backgroundColor: "red",
  },
  transcript: {
    color: "#555",
    fontStyle: "italic",
  },
  resultsList: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    margin: "10px 0",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  question: {
    color: "#007BFF",
  },
  answer: {
    color: "#333",
  },
};

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

      const matchingTrigger = questionTriggers.find((trigger) =>
        speechText.includes(trigger)
      );

      if (matchingTrigger) {
        const query = speechText.replace(matchingTrigger, "").trim();
        console.log("Extracted Query:", query);
        searchQuestion(query);
      } else {
        console.log("No question trigger detected. Searching entire text...");
        searchQuestion(speechText);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const searchQuestion = (input) => {
    console.log("Searching for:", input);
  
    const normalizedInput = input.toLowerCase();
  
    // Exact phrase matching
    const exactResults = test_data.filter((item) =>
      item.question.toLowerCase().includes(normalizedInput)
    );
  
    if (exactResults.length > 0) {
      const uniqueResults = filterUniqueAnswers(exactResults);
      setSearchResults(uniqueResults);
      console.log("Exact matches found:", uniqueResults);
      return;
    }
  
    console.log("No exact matches found. Searching by keywords...");
  
    // Split input into keywords and filter out very short/common words
    const keywords = normalizedInput
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !["tell", "me", "about", "how", "can", "what", "is", "in"].includes(word)
      );
  
    // Keyword-based matching with relevance threshold
    const keywordResults = test_data.filter((item) => {
      const questionWords = item.question.toLowerCase().split(" ");
      const commonKeywords = keywords.filter((keyword) =>
        questionWords.includes(keyword)
      );
      return commonKeywords.length / keywords.length >= 0.5; // At least 50% of keywords must match
    });
  
    if (keywordResults.length > 0) {
      const uniqueResults = filterUniqueAnswers(keywordResults);
      setSearchResults(uniqueResults);
      console.log("Keyword matches found:", uniqueResults);
      return;
    }
  
    console.log("No keyword matches found. Applying weighted fuzzy matching...");
  
    // Fuzzy matching with weighted scoring
    const fuzzyResults = test_data
      .map((item) => {
        const questionWords = item.question.toLowerCase().split(" ");
        const matchedKeywords = keywords.filter((keyword) =>
          questionWords.some((word) => word.startsWith(keyword))
        );
        const score = matchedKeywords.length / keywords.length; // Calculate match score
        return { item, score };
      })
      .filter(({ score }) => score >= 0.5) // Only include results with at least 50% match
      .sort((a, b) => b.score - a.score) // Sort by highest relevance
      .map(({ item }) => item);
  
    const uniqueResults = filterUniqueAnswers(fuzzyResults);
    setSearchResults(uniqueResults);
    console.log("Fuzzy matches found:", uniqueResults);
  };
  
  const filterUniqueAnswers = (results) => {
    const seenAnswers = new Set();
    return results.filter((result) => {
      if (seenAnswers.has(result.answer)) {
        return false;
      }
      seenAnswers.add(result.answer);
      return true;
    });
  };
  

  return (
    <div style={styles.container}>
      <h1>Interview Q&A Finder</h1>
      <button
        onClick={() => setIsListening(!isListening)}
        style={{
          ...styles.button,
          ...(isListening ? styles.buttonActive : {}),
        }}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <p style={styles.transcript}>
        Transcript: <strong>{transcript}</strong>
      </p>
      <h2>Results</h2>
      {searchResults.length > 0 ? (
        <ul style={styles.resultsList}>
          {searchResults.map((item, index) => (
            <li key={index} style={styles.listItem}>
              <p style={styles.question}>
                <strong>Q:</strong> {item.question}
              </p>
              <p style={styles.answer}>
                <strong>A:</strong> {item.answer}
              </p>
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
