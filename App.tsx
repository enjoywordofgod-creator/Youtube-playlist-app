import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Admin from "./components/Admin";
import { supabase } from "./supabase";
import { fetchYouTubePlaylist } from "./services/youtubeService";
import { Message } from "./types";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "./Login";

const YOUTUBE_API_KEY = "AIzaSyDYDcdAHtSCudlMcZc82IeMAT3msXnO_2E";

const App = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaylists = async () => {
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .order("id", { ascending: false });

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    const playlistUrl = data[0].playlist_url;
    const match = playlistUrl.match(/list=([^&]+)/);

    if (!match) {
      setLoading(false);
      return;
    }

    const playlistId = match[1];
    const videos = await fetchYouTubePlaylist(playlistId, YOUTUBE_API_KEY);
    setMessages(videos);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <Routes>
      {/* Home Route */}
      <Route
        path="/"
        element={
          <Layout title="Church Messages">
            {loading ? (
              <div style={{ padding: "40px" }}>Loading...</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => navigate(`/message/${msg.id}`)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                >
                  <img src={msg.thumbnail} style={{ width: "80px", borderRadius: "8px" }} alt="" />
                  <div>
                    <div style={{ fontWeight: "bold" }}>{msg.title}</div>
                  </div>
                </div>
              ))
            )}
          </Layout>
        }
      />

      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;