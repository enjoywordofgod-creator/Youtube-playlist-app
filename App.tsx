import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import VideoPlayer from "./components/VideoPlayer";
import Admin from "./components/Admin";
import { useLanguage } from "./LanguageContext";
import { Message, DailyVerse, Playlist } from "./types";
import { supabase } from "./supabase";
import { fetchYouTubePlaylist } from "./services/youtubeService";

const YOUTUBE_API_KEY = "PASTE_YOUR_API_KEY_HERE";

const App: React.FC = () => {

const navigate = useNavigate();
const { t, language } = useLanguage();

const [messages, setMessages] = useState<Message[]>([]);
const [playlists, setPlaylists] = useState<Playlist[]>([]);
const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [loading, setLoading] = useState(true);

/* ---------------- LOAD PLAYLISTS FROM SUPABASE ---------------- */

const loadPlaylists = async () => {

const { data } = await supabase
.from("playlists")
.select("*")
.order("id", { ascending: false });

if (!data || data.length === 0) {
setLoading(false);
return;
}

/* convert playlist links → playlist ids */

const playlistIds = data
.map((p) => {
const match = p.playlist_url.match(/list=([^&]+)/);
return match ? match[1] : null;
})
.filter(Boolean);

/* load videos from first playlist */

const videos = await fetchYouTubePlaylist(
playlistIds[0],
YOUTUBE_API_KEY
);

const transformed: Message[] = videos.map((v) => ({
id: v.id,
title: v.title,
videoId: v.videoId,
thumbnail: v.thumbnail,
date: v.date,
duration: v.duration,
createdAt: v.createdAt,
videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
}));

setMessages(transformed);

setPlaylists([
{
id: "main",
title: "Messages",
description: "Loaded from YouTube Playlist",
thumbnail: transformed[0]?.thumbnail || "",
messageIds: transformed.map((m) => m.id),
},
]);

setLoading(false);
};

/* ---------------- LOAD DATA ---------------- */

useEffect(() => {

loadPlaylists();

setDailyVerse({
verse:
language === "ta"
? "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்."
: "The Lord is my shepherd; I shall not want.",
reference: language === "ta" ? "சங்கீதம் 23:1" : "Psalm 23:1",
});

}, [language]);

/* ---------------- SEARCH ---------------- */

const filteredMessages = useMemo(() => {

const query = searchQuery.toLowerCase();

if (!query) return messages;

return messages.filter((m) =>
m.title.toLowerCase().includes(query)
);

}, [searchQuery, messages]);

/* ---------------- HOME PAGE ---------------- */

const renderHome = (

<div className="px-6 py-4 space-y-8">

{dailyVerse && (
<div className="bg-indigo-600 rounded-3xl p-6 text-white">
<h3 className="text-xs uppercase mb-2">{t.dailyVerse}</h3>
<p className="italic text-lg">"{dailyVerse.verse}"</p>
<p className="text-sm mt-2">— {dailyVerse.reference}</p>
</div>
)}

<div className="space-y-4">

<h3 className="text-lg font-bold">{t.messages}</h3>

{loading ? (
<div>Loading...</div>
) : filteredMessages.map((msg) => (

<button
key={msg.id}
onClick={() => navigate(`/message/${msg.id}`)}
className="w-full text-left border rounded-2xl p-4 flex gap-4"
>

<img
src={msg.thumbnail}
className="w-16 h-16 rounded-xl"
alt=""
/>

<div>
<h4 className="font-bold">{msg.title}</h4>
<p className="text-sm text-gray-500">
{msg.duration} • {msg.date}
</p>
</div>

</button>

))}

</div>

</div>
);

/* ---------------- ROUTES ---------------- */

return (

<Routes>

<Route
path="/"
element={
<Layout
title={t.appTitle}
latestMessages={messages}
searchQuery={searchQuery}
onSearchChange={setSearchQuery}
onMessageClick={(msg) =>
navigate(`/message/${msg.id}`)
}
>
{renderHome}
</Layout>
}
/>

<Route
path="/message/:id"
element={<MessagePage messages={messages} />}
/>

<Route path="/admin" element={<Admin />} />

</Routes>

);

};

/* ---------------- MESSAGE PAGE ---------------- */

const MessagePage: React.FC<{ messages: Message[] }> = ({ messages }) => {

const { id } = useParams<{ id: string }>();

const message = messages.find((m) => m.id === id);

if (!message) return <div>No message</div>;

return <VideoPlayer message={message} />;

};

export default App;