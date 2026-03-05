import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import VideoPlayer from "./components/VideoPlayer";
import Admin from "./components/Admin";
import { supabase } from "./supabase";
import { fetchYouTubePlaylist } from "./services/youtubeService";
import { Message } from "./types";

const YOUTUBE_API_KEY = "PASTE_YOUR_API_KEY_HERE";

const App = () => {

const navigate = useNavigate();
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(true);

const loadPlaylists = async () => {

const { data } = await supabase
.from("playlists")
.select("*")
.order("id",{ascending:false});

if(!data || data.length===0){
setLoading(false);
return;
}

const playlistUrl = data[0].playlist_url;
const match = playlistUrl.match(/list=([^&]+)/);

if(!match){
setLoading(false);
return;
}

const playlistId = match[1];

const videos = await fetchYouTubePlaylist(
playlistId,
YOUTUBE_API_KEY
);

setMessages(videos);
setLoading(false);

};

useEffect(()=>{
loadPlaylists();
},[]);

return(

<Routes>

<Route
path="/"
element={
<Layout title="Church Messages">

{loading ? (
<div style={{padding:"40px"}}>Loading...</div>
) : (

messages.map((msg)=>(
<div
key={msg.id}
onClick={()=>navigate(`/message/${msg.id}`)}
style={{
display:"flex",
gap:"12px",
padding:"12px",
borderBottom:"1px solid #eee",
cursor:"pointer"
}}
>

<img
src={msg.thumbnail}
style={{width:"80px",borderRadius:"8px"}}
/>

<div>
<div style={{fontWeight:"bold"}}>{msg.title}</div>
<div style={{fontSize:"12px",color:"#666"}}>
{msg.duration}
</div>
</div>

</div>
))

)}

</Layout>
}
/>

<Route
path="/message/:id"
element={<MessagePage messages={messages}/>}
/>

{/* ADMIN PAGE */}
<Route path="/admin" element={<Admin/>}/>

</Routes>

);

};

const MessagePage = ({messages}:{messages:Message[]}) => {

const {id} = useParams();

const message = messages.find(m=>m.id===id);

if(!message) return <div>No video</div>;

return <VideoPlayer message={message}/>;

};

export default App;