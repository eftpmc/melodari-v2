import React, { useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

const DemoModal = () => {
  const [songs] = useState([
    { id: '1', title: 'PROVOLONE & HEROIN (feat. Freddie Dredd)', artist: '$uicideboy$', topic: 'Lyric Video', thumbnailUrl: 'https://lh3.googleusercontent.com/fljlUw6axO7TYMfPcMY1CozJJ1oVGz-f3ObEGrz9gGlEZwJQJfQQhbrT7w8E4Iy_Z7l7dH1t2WnXHUankg=w120-h120-l90-rj' },
    { id: '4', title: 'MY MIND IZ FULL OF GHOSTS', artist: 'Roland Jones', topic: 'Topic', thumbnailUrl: 'https://lh3.googleusercontent.com/j_A5vBfL2JcVvMgQh1iaHq6xKdwVJqDyYIweBfAyqeHQxd462xII1lO5C-ss0e0V0Qt8wfktU-KRuDc=w120-h120-l90-rj' },
    { id: '5', title: '4 DA CHEWIN', artist: 'Roland Jones', topic: 'Topic', thumbnailUrl: 'https://lh3.googleusercontent.com/j_A5vBfL2JcVvMgQh1iaHq6xKdwVJqDyYIweBfAyqeHQxd462xII1lO5C-ss0e0V0Qt8wfktU-KRuDc=w120-h120-l90-rj' },
    { id: '6', title: 'HUNNID DEEP (feat. Soudiere)', artist: 'Roland Jones', topic: 'Topic', thumbnailUrl: 'https://lh3.googleusercontent.com/7t0svlbMmOYP_4e4Ly3_RaLD7W0bvZ2pSVAy8SGOPepLmqB9PxDE19D6mkKvy93pVP-T4HOfY6tSbMN1=w120-h120-l90-rj' },
    { id: '7', title: 'WHAT THEY DOING (feat. TENNGAGE, APOC KRYSIS & JUPILATOR)', artist: 'Roland Jones', topic: 'Topic', thumbnailUrl: 'https://lh3.googleusercontent.com/V6XAWRnLgN3OUbM2w1OjOZ8oRo1cGbkZbUKlx2xT4FxiS3E_VBwewKzXZbguZqsjQ1qopxYr2ntt7A0=w120-h120-l90-rj' },
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
          {songs.map((song) => (
            <li key={song.id} className="flex items-center justify-between py-2 text-base-content">
              <div className="flex items-center space-x-2 w-full">
                {/* Replace index with song thumbnail */}
                <img 
                  src={song.thumbnailUrl} 
                  alt={song.title} 
                  className="w-12 h-12 object-cover rounded-md mr-4" 
                />
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-base-content truncate">
                    {song.title}
                  </span>
                  <span className="text-sm text-base-content opacity-60 truncate">
                    {song.artist}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DemoModal;