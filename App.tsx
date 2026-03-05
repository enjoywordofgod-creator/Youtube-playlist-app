import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import VideoPlayer from "./components/VideoPlayer";
import Admin from "./components/Admin";
import { useLanguage } from "./LanguageContext";
import { Message, DailyVerse, Playlist } from "./types";
import { fetchYouTubePlaylist } from "./services/youtubeService";

/* ===============================
   PUT YOUR YOUTUBE SETTINGS HERE
================================ */

const YOUTUBE_API_KEY = "AIzaSyDYDcdAHtSCudlMcZc82IeMAT3msXnO_2E";
const PLAYLIST_ID = "PLHDAYT3bOm5l0qqszuRM8rbqPRdRIyzPT";

/* =============================== */

const App: React.FC = () => {

const navigate = useNavigate();
const location = useLocation();
const { t, language } = useLanguage();

const [messages, setMessages] = useState<Message[]>([]);
const [playlists, setPlaylists] = useState<Playlist[]>([]);
const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

/* FETCH YOUTUBE DATA */

const fetchData = React.useCallback(async () => {

try {

setError(null);

const youtubeVideos = await fetchYouTubePlaylist(
PLAYLIST_ID,
YOUTUBE_API_KEY
);

const transformedMessages: Message[] = youtubeVideos.map((v) => ({
id: v.id,
title: v.title,
videoId: v.videoId,
thumbnail: v.thumbnail,
date: v.date,
duration: v.duration,
createdAt: v.createdAt,
videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
}));

setMessages(transformedMessages);

setPlaylists([
{
id: "main",
title: language === "ta" ? "அனைத்து செய்திகள்" : "All Messages",
description:
language === "ta"
? "யூடியூப் பிளேலிஸ்ட்டிலிருந்து தானாகவே எடுக்கப்பட்டது"
: "Automatically fetched from YouTube playlist",
thumbnail: transformedMessages[0]?.thumbnail || "",
messageIds: transformedMessages.map((m) => m.id),
},
]);

} catch (err) {

const msg = err instanceof Error ? err.message : "Failed to fetch data";
setError(msg);

} finally {
setLoading(false);
}

}, [language]);

/* LOAD DATA */

useEffect(() => {

fetchData();

setDailyVerse({
verse:
language === "ta"
? "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்."
: "The Lord is my shepherd; I shall not want.",
reference: language === "ta" ? "சங்கீதம் 23:1" : "Psalm 23:1",
});

}, [language, fetchData]);

/* CLICK HANDLERS */

const handleMessageClick = (msg: Message) => {
navigate(`/message/${msg.id}`);
};

const goBack = () => {
navigate(-1);
};

/* SEARCH */

const filteredMessages = useMemo(() => {

const query = searchQuery.toLowerCase().trim();
if (!query) return messages;

return messages.filter((msg) =>
msg.title.toLowerCase().includes(query)
);

}, [searchQuery, messages]);

/* HOME PAGE */

const renderHome = (

<div className="px-6 py-4 space-y-8">

{dailyVerse && (
<div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
<h3 className="text-indigo-200 text-xs font-bold uppercase mb-2">
{t.dailyVerse}
</h3>
<p className="text-lg italic">"{dailyVerse.verse}"</p>
<p className="mt-2 text-sm">— {dailyVerse.reference}</p>
</div>
)}

{!searchQuery && playlists.length > 0 && (
<div className="space-y-4">
<h3 className="text-lg font-bold">{t.playlists}</h3>

<div className="flex gap-4 overflow-x-auto">

{playlists.map((pl) => (
<button
key={pl.id}
onClick={() => navigate(`/playlist/${pl.id}`)}
className="w-40"
>
<img src={pl.thumbnail} className="rounded-xl" alt="" />
<h4 className="font-bold text-sm mt-2">{pl.title}</h4>
</button>
))}

</div>
</div>
)}

<div className="space-y-4">
<h3 className="text-lg font-bold">{t.messages}</h3>

{loading ? (
<div>{t.loading}</div>
) : filteredMessages.map((msg) => (

<button
key={msg.id}
onClick={() => handleMessageClick(msg)}
className="w-full text-left bg-white border rounded-2xl p-4 flex gap-4"
>

<img src={msg.thumbnail} className="w-16 h-16 rounded-xl" alt="" />

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

return (

<Routes>

<Route
path="/"
element={
<Layout
title={t.appTitle}
latestMessages={messages}
onMessageClick={(msg) => navigate(`/message/${msg.id}`)}
searchQuery={searchQuery}
onSearchChange={setSearchQuery}
>
{renderHome}
</Layout>
}
/>

<Route
path="/playlist/:id"
element={
<Layout
title={t.playlists}
onBack={goBack}
latestMessages={messages}
onMessageClick={(msg) => navigate(`/message/${msg.id}`)}
>
<PlaylistPage messages={messages} playlists={playlists} />
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

/* PLAYLIST PAGE */

const PlaylistPage: React.FC<{ messages: Message[]; playlists: Playlist[] }> = ({
messages,
playlists,
}) => {

const { id } = useParams<{ id: string }>();
const navigate = useNavigate();

const playlist = playlists.find((p) => p.id === id);

if (!playlist) return <div>No Playlist</div>;

const playlistMessages = playlist.messageIds
.map((id) => messages.find((m) => m.id === id))
.filter((m): m is Message => m !== undefined);

return (

<div className="px-6 py-4 space-y-4">

<h2 className="text-2xl font-bold">{playlist.title}</h2>

{playlistMessages.map((msg) => (

<button
key={msg.id}
onClick={() => navigate(`/message/${msg.id}`)}
className="w-full text-left bg-white border rounded-xl p-4 flex gap-4"
>

<img src={msg.thumbnail} className="w-14 h-14 rounded-lg" alt="" />

<div>
<h4 className="font-bold">{msg.title}</h4>
<p className="text-xs">{msg.duration}</p>
</div>

</button>

))}

</div>

);

};

/* VIDEO PAGE */

const MessagePage: React.FC<{ messages: Message[] }> = ({ messages }) => {

const { id } = useParams<{ id: string }>();

const message = messages.find((m) => m.id === id);

if (!message) return <div>No message</div>;

return <VideoPlayer message={message} />;

};

export default App;