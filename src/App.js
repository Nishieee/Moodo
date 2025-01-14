import React, { useState, useEffect } from "react";
import "./App.css";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      await onLogin(email, password);
      console.log("Login successful");
    } catch (err) {
      setError(err.message); // Display error message
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Login</h1>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

const SignupPage = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      await onSignup(email, username, password);
      console.log("Signup successful");
    } catch (err) {
      setError(err.message); // Display error message as a string
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Sign Up</h1>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

const handleLogin = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  try {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    console.log("Login successful!");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const handleSignup = async (email, username, password) => {
  if (!email || !username || !password) {
    throw new Error("All fields are required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  try {
    const response = await fetch("http://127.0.0.1:8000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }), // Correct structure
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Signup failed");
    }

    const data = await response.json();
    console.log("Signup successful!", data);
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};



const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [selectedMood, setSelectedMood] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [currentPage, setCurrentPage] = useState("mood");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [journalEntry, setJournalEntry] = useState("");

  const journalPrompts = [
    "How was your day today?",
    "When did you feel the happiest this week?",
    "Share a happy memory that makes you smile",
    "What are you grateful for today?",
    "What's something you're looking forward to?",
    "What made you laugh today?",
    "Describe a moment that brought you peace",
    "What's a small win you celebrated today?"
  ];

  const [pastEntries, setPastEntries] = useState([
    {
      id: 1,
      date: "2024-01-12",
      prompt: "How was your day today?",
      entry: "Today was quite productive. I managed to complete all my tasks and even had time for a short walk.",
      mood: "😎"
    },
    {
      id: 2,
      date: "2024-01-11",
      prompt: "What made you laugh today?",
      entry: "Had a funny video call with my best friend. We couldn't stop laughing about old memories.",
      mood: "🙂"
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const getAIResponse = async (emoji) => {
    try {
      console.log('Making request to backend with emoji:', emoji);
      const response = await fetch('http://127.0.0.1:8000/api/get-mood-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      console.log('Backend response status:', response.status);
      const responseText = await response.text();
      console.log('Backend response text:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.detail || 'Failed to get AI response');
        } catch (e) {
          throw new Error(`Server error: ${responseText}`);
        }
      }

      try {
        const data = JSON.parse(responseText);
        return data.response;
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Error details:', error);
      return `Error getting AI response: ${error.message}`;
    }
  };

  const handleEmojiClick = async (mood) => {
    setSelectedMood(`You selected: ${mood}`);
    setAiResponse("Getting a thoughtful response for you...");
    const response = await getAIResponse(mood);
    setAiResponse(response);
  };

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: pastEntries.length + 1,
      date: new Date().toISOString().split('T')[0],
      prompt: selectedPrompt,
      entry: journalEntry,
      mood: selectedMood.split(": ")[1] || "📝"
    };
    setPastEntries([newEntry, ...pastEntries]);
    setJournalEntry("");
    setSelectedPrompt("");
    alert("Journal entry saved!");
  };

  const MoodPage = () => (
    <>
      <h1 style={{
        color: "#fff",
        fontSize: "2.5rem",
        marginBottom: "20px",
        fontWeight: "600"
      }}>Rate Your Mood</h1>
      <p style={{
        color: "#e0e0e0",
        fontSize: "1.2rem",
        marginBottom: "30px"
      }}>How are you feeling today?</p>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        margin: "40px 0",
        flexWrap: "wrap"
      }}>
        {["😎", "🙂", "😐", "😔", "😢"].map((emoji) => (
          <div
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            style={{
              fontSize: "3.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: "15px",
              borderRadius: "50%",
              background: "rgba(60, 60, 60, 0.8)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid transparent",
              transform: selectedMood.includes(emoji) ? "scale(1.1)" : "scale(1)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.2) translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.3)";
              e.currentTarget.style.border = "3px solid #ff6b6b";
              e.currentTarget.style.background = "rgba(70, 70, 70, 0.9)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = selectedMood.includes(emoji) ? "scale(1.1)" : "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.border = "3px solid transparent";
              e.currentTarget.style.background = "rgba(60, 60, 60, 0.8)";
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {(selectedMood || aiResponse) && (
        <div style={{
          marginTop: "40px",
          padding: "30px",
          background: "linear-gradient(135deg, #2d2d2d 0%, #353535 100%)",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          {selectedMood && (
            <p style={{
              fontSize: "1.4rem",
              color: "#fff",
              marginBottom: "20px",
              fontWeight: "500"
            }}>
              {selectedMood}
            </p>
          )}
          {aiResponse && (
            <div style={{
              padding: "20px",
              backgroundColor: "rgba(80, 80, 80, 0.8)",
              borderRadius: "12px",
              marginTop: "15px",
              border: "2px solid #ff6b6b",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}>
              <p style={{
                color: "#fff",
                fontSize: "1.2rem",
                lineHeight: "1.6",
                margin: 0
              }}>
                {aiResponse}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );



  const JournalPage = () => (
    <>
      <h1 style={{
        color: "#fff",
        fontSize: "2.5rem",
        marginBottom: "20px",
        fontWeight: "600"
      }}>Journal Your Thoughts</h1>

      <div style={{
        marginTop: "30px",
        marginBottom: "30px"
      }}>
        <select
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
          style={{
            width: "80%",
            padding: "15px",
            fontSize: "1.1rem",
            backgroundColor: "rgba(60, 60, 60, 0.8)",
            color: "#fff",
            border: "2px solid #ff6b6b",
            borderRadius: "10px",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="">Select a prompt...</option>
          {journalPrompts.map((prompt, index) => (
            <option key={index} value={prompt}>{prompt}</option>
          ))}
        </select>
      </div>

      {selectedPrompt && (
        <form onSubmit={handleJournalSubmit} style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "20px",
              fontSize: "1.1rem",
              backgroundColor: "rgba(60, 60, 60, 0.8)",
              color: "#fff",
              border: "2px solid #ff6b6b",
              borderRadius: "10px",
              marginBottom: "20px",
              resize: "vertical",
              outline: "none"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 30px",
              fontSize: "1.1rem",
              backgroundColor: "#ff6b6b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#ff5252";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#ff6b6b";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Save Entry
          </button>
        </form>
      )}
    </>
  );

  const EntriesPage = () => (
    <>
      <h1 style={{
        color: "#fff",
        fontSize: "2.5rem",
        marginBottom: "20px",
        fontWeight: "600"
      }}>Past Entries</h1>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px 0"
      }}>
        {pastEntries.map((entry) => (
          <div key={entry.id} style={{
            padding: "25px",
            backgroundColor: "rgba(60, 60, 60, 0.8)",
            borderRadius: "15px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "left",
            animation: "fadeIn 0.5s ease-out"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <span style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>{entry.date}</span>
              <span style={{ fontSize: "1.5rem" }}>{entry.mood}</span>
            </div>
            <p style={{
              color: "#e0e0e0",
              fontSize: "1.1rem",
              fontStyle: "italic",
              marginBottom: "10px"
            }}>
              "{entry.prompt}"
            </p>
            <p style={{ color: "#fff", fontSize: "1rem", lineHeight: "1.6" }}>
              {entry.entry}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div style={{
      minHeight: "100vh",
      textAlign: "center",
      padding: "40px 20px",
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {!isAuthenticated ? (
        <div>
          <div className="auth-tabs">
            <button
              onClick={() => setShowLogin(true)}
              className={`auth-switch ${showLogin ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`auth-switch ${!showLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>
          {showLogin ? (
            <LoginPage onLogin={() => setIsAuthenticated(true)} />
          ) : (
            <SignupPage onSignup={handleSignup} />
          )}
        </div>
      ) : (
        <>
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 25px",
              fontSize: "1.1rem",
              backgroundColor: "rgba(60, 60, 60, 0.8)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              position: "absolute",
              right: "20px",
              top: "20px"
            }}
          >
            Logout
          </button>

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            maxWidth: "800px",
            margin: "0 auto 20px auto",
          }}>
            {["mood", "journal", "entries"].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "12px 25px",
                  fontSize: "1.1rem",
                  backgroundColor: currentPage === page ? "#ff6b6b" : "rgba(60, 60, 60, 0.8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: currentPage === page ? "translateY(0)" : "translateY(5px)",
                  boxShadow: currentPage === page
                    ? "0 4px 15px rgba(255, 107, 107, 0.3)"
                    : "0 4px 15px rgba(0, 0, 0, 0.2)",
                }}
                onMouseOver={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.backgroundColor = "rgba(80, 80, 80, 0.9)";
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.transform = "translateY(5px)";
                    e.currentTarget.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
                  }
                }}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </div>

          {/* Main Content Card */}
          <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "30px",
            backgroundColor: "rgba(45, 45, 45, 0.9)",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            {currentPage === "mood" && <MoodPage />}
            {currentPage === "journal" && <JournalPage />}
            {currentPage === "entries" && <EntriesPage />}
          </div>
        </>
      )}
    </div>
  );
};



export default App;
