import React,{useState} from "react";
import { supabase } from "../supabase";

const Admin = () => {

const [playlist,setPlaylist] = useState("");
const [status,setStatus] = useState("");

const addPlaylist = async () => {

if(!playlist){
setStatus("Enter playlist link");
return;
}

const {error} = await supabase
.from("playlists")
.insert([{playlist_url:playlist}]);

if(error){
setStatus("Error saving playlist");
}else{
setStatus("Playlist added!");
setPlaylist("");
}

};

return(

<div style={{
maxWidth:"400px",
margin:"100px auto",
textAlign:"center"
}}>

<h2>Admin Panel</h2>

<input
placeholder="Paste YouTube Playlist"
value={playlist}
onChange={(e)=>setPlaylist(e.target.value)}
style={{
width:"100%",
padding:"10px",
marginTop:"20px"
}}
/>

<button
onClick={addPlaylist}
style={{
marginTop:"20px",
padding:"10px 20px"
}}
>
Add Playlist
</button>

<div style={{marginTop:"20px"}}>
{status}
</div>

</div>

);

};

export default Admin;