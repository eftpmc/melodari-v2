import React, { useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import { BsThreeDotsVertical } from 'react-icons/bs';

const DemoModal = () => {
  const [songs] = useState([
    { id: '1', title: 'PROVOLONE & HEROIN (feat. Freddie Dredd)', artist: '$uicideboy$', topic: 'Lyric Video' },
    { id: '4', title: 'MY MIND IZ FULL OF GHOSTS', artist: 'Roland Jones', topic: 'Topic' },
    { id: '5', title: '4 DA CHEWIN', artist: 'Roland Jones', topic: 'Topic' },
    { id: '6', title: 'HUNNID DEEP (feat. Soudiere)', artist: 'Roland Jones', topic: 'Topic' },
    { id: '7', title: 'WHAT THEY DOING (feat. TENNGAGE, APOC KRYSIS & JUPILATOR)', artist: 'Roland Jones', topic: 'Topic' },
  ]);

  const playlist = {
    title: "dred",
    accountName: "ari",
    imageUrl: "/grunge.gif", // Use a valid image path for your playlist
  };

  return (
    <div className="relative p-2 w-full max-w-4xl mx-auto bg-base-100 rounded-xl shadow-lg">
      {/* Close Button */}
      <label className="btn btn-sm btn-circle absolute right-2 top-2 text-base-content">
        ✕
      </label>

      <div className="relative w-full p-4">
        {/* Playlist Header */}
        <div className="flex items-start mb-4">
          <img
            src={playlist.imageUrl}
            alt={playlist.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="ml-4 flex-1">
            <h3 className="text-2xl font-bold text-base-content truncate">
              {playlist.title}
            </h3>
            <p className="text-sm text-base-content opacity-60 truncate">{playlist.accountName}</p>

            {/* Platform Icons */}
            <div className="flex items-center space-x-2 mt-2">
              <SiYoutubemusic className="text-red-600 w-6 h-6" />
              <FaSpotify className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Songs List */}
        <ul className="space-y-4 max-h-70 overflow-y-auto overflow-x-hidden pt-2 border-t border-base-300">
          {songs.map((song, index) => (
            <li key={song.id} className="flex items-center justify-between py-2 text-base-content">
              <div className="flex items-center space-x-2 w-full">
                <span className="mr-4 text-base-content font-semibold opacity-70">{index + 1}.</span>
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-base-content truncate">
                    {song.title}
                  </span>
                  <span className="text-sm text-base-content opacity-60 truncate">
                    {song.artist}
                  </span>
                </div>
              </div>
              <BsThreeDotsVertical className="text-base-content opacity-60 hover:text-opacity-100 cursor-pointer" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DemoModal;
