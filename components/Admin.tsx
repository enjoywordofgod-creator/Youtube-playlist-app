import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

interface Playlist {
id: number;
playlist_url: string;
}

const Admin: React.FC = () => {
const [playlistUrl, setPlaylistUrl] = useState("");
const [playlists, setPlaylists] = useState<Playlist[]>([]);

const loadPlaylists = async () => {
  try {
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setPlaylists(data as Playlist[]);
    }
  } catch (err) {
    console.error("Error loading playlists", err);
  }
};

useEffect(() => {
loadPlaylists();
}, []);

const addPlaylist = async () => {
  if (!playlistUrl) return;

  try {
    await supabase.from("playlists").insert([
      {
        playlist_url: playlistUrl,
      },
    ]);

    setPlaylistUrl("");
    loadPlaylists();
  } catch (err) {
    console.error("Error adding playlist", err);
  }
};

const deletePlaylist = async (id: number) => {
await supabase.from("playlists").delete().eq("id", id);
loadPlaylists();
};

return (
  <div className="p-6 max-w-xl mx-auto space-y-6">
    <h1 className="text-3xl font-bold">Admin Panel</h1>

    <div className="space-y-3">
      <input
        type="text"
        placeholder="Paste YouTube Playlist Link"
        value={playlistUrl}
        onChange={(e) => setPlaylistUrl(e.target.value)}
        className="w-full border p-3 rounded-lg"
      />

      <button
        onClick={addPlaylist}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg w-full"
      >
        Add Playlist
      </button>
    </div>

    <div className="space-y-3">
      <h2 className="text-xl font-bold">Playlists</h2>

      {playlists.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center border p-3 rounded-lg"
        >
          <span className="text-sm break-all">{p.playlist_url}</span>

          <button
            onClick={() => deletePlaylist(p.id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
);
};

export default Admin;
