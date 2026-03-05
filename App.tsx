import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import VideoPlayer from "./components/VideoPlayer";
import Admin from "./components/Admin";
import { useLanguage } from "./LanguageContext";
import { Message, DailyVerse, Playlist } from "./types";
import { Music, Info as InfoIcon } from "lucide-react";
import { fetchYouTubePlaylist } from "./services/youtubeService";

const API_KEY = "PASTE_YOUR_YOUTUBE_API_KEY";

const PLAYLISTS = [
  {
    id: "sermons",
    title: "Sunday Sermons",
    playlistId: "PLHDAYT3bOm5l0qqszuRM8rbqPRdRIyzPT",
  },
  {
    id: "bible",
    title: "Bible Study",
    playlistId: "PUT_SECOND_PLAYLIST_ID_HERE",
  },
  {
    id: "special",
    title: "Special Messages",
    playlistId: "PUT_THIRD_PLAYLIST_ID_HERE",
  },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [parentMessage, setParentMessage] = useState<Message | null>(null);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let allMessages: Message[] = [];
      let allPlaylists: Playlist[] = [];

      for (const p of PLAYLISTS) {
        const videos = await fetchYouTubePlaylist(p.playlistId, API_KEY);

        const msgs: Message[] = videos.map((v) => ({
          id: `${p.id}-${v.videoId}`,
          title: v.title,
          videoId: v.videoId,
          thumbnail: v.thumbnail,
          date: v.date,
          duration: v.duration,
          createdAt: v.createdAt,
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        }));

        allMessages.push(...msgs);

        allPlaylists.push({
          id: p.id,
          title: p.title,
          description: "YouTube Playlist",
          thumbnail: msgs[0]?.thumbnail || "",
          messageIds: msgs.map((m) => m.id),
        });
      }

      setMessages(allMessages);
      setPlaylists(allPlaylists);
    } catch (err) {
      console.error(err);
      setError("Failed to load YouTube playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    setDailyVerse({
      verse:
        language === "ta"
          ? "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்."
          : "The Lord is my shepherd; I shall not want.",
      reference: language === "ta" ? "சங்கீதம் 23:1" : "Psalm 23:1",
    });
  }, [language]);

  const handleMessageClick = (msg: Message) => {
    if (msg.subMessages && msg.subMessages.length > 0) {
      setParentMessage(msg);
      navigate("/subtitles");
    } else {
      navigate(`/message/${msg.id}`);
    }
  };

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => m.title.toLowerCase().includes(q));
  }, [searchQuery, messages]);

  const renderHome = () => (
    <div className="px-6 py-4 space-y-8">
      {dailyVerse && (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white">
          <h3 className="text-xs font-bold mb-2">{t.dailyVerse}</h3>
          <p className="italic">{dailyVerse.verse}</p>
          <p className="text-sm mt-2">— {dailyVerse.reference}</p>
        </div>
      )}

      {!searchQuery && playlists.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">{t.playlists}</h3>

          <div className="flex gap-4 overflow-x-auto">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="w-40 text-left"
              >
                <img
                  src={pl.thumbnail}
                  className="rounded-xl mb-2"
                />
                <p className="font-bold text-sm">{pl.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-4">{t.messages}</h3>

        {loading && <p>Loading...</p>}

        {!loading &&
          filteredMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleMessageClick(msg)}
              className="w-full text-left flex gap-4 mb-3"
            >
              <img
                src={msg.thumbnail}
                className="w-16 h-16 rounded-lg"
              />
              <div>
                <p className="font-bold">{msg.title}</p>
                <p className="text-sm text-gray-500">
                  {msg.duration} • {msg.date}
                </p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  const isPlayerPage =
    location.pathname.startsWith("/player") ||
    location.pathname.startsWith("/message/");

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />

      <Route
        path="*"
        element={
          <Layout
            title={isPlayerPage ? t.nowPlaying : t.appTitle}
            latestMessages={messages}
            onMessageClick={(msg) => navigate(`/message/${msg.id}`)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          >
            <Routes>
              <Route path="/" element={renderHome()} />
              <Route
                path="/playlist/:id"
                element={<PlaylistPage messages={messages} playlists={playlists} />}
              />
              <Route
                path="/message/:id"
                element={<MessagePage messages={messages} />}
              />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

const PlaylistPage: React.FC<{ messages: Message[]; playlists: Playlist[] }> = ({
  messages,
  playlists,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) return <div>No playlist</div>;

  const list = playlist.messageIds
    .map((mid) => messages.find((m) => m.id === mid))
    .filter((m): m is Message => !!m);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{playlist.title}</h2>

      {list.map((msg) => (
        <button
          key={msg.id}
          onClick={() => navigate(`/message/${msg.id}`)}
          className="flex gap-4 mb-3"
        >
          <img src={msg.thumbnail} className="w-16 h-16 rounded-lg" />
          <div>
            <p className="font-bold">{msg.title}</p>
            <p className="text-sm text-gray-500">
              {msg.duration} • {msg.date}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

const MessagePage: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const { id } = useParams();

  const message = messages.find((m) => m.id === id);

  if (!message) return <div>No message</div>;

  return <VideoPlayer message={message} />;
};

export default App;

