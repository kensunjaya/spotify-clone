import { useEffect, useState } from 'react'
import axios from 'axios';
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import SpotifyWebApi from 'spotify-web-api-node';
import { Progress } from "flowbite-react";
// import './App.css'

interface Track {
  name: string;
  artists: any;
  album: any;
  thumbnail: string;
}

const App = () => {
  const [audio, setAudio] = useState<any | null>(new Audio());
  const [track, setTrack] = useState<Track | null>(null);
  const [paused, setPaused] = useState<boolean>(true);
  const [tracks, setTracks] = useState<any | null>([]);
  const [spotifyApi, setSpotifyApi] = useState<SpotifyWebApi | null>(null);
  const [audioPosition, setAudioPosition] = useState<number>(0);

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const getAccessToken = async (clientId: string, clientSecret: string) => {
    const response = await fetch("http://localhost:5050/accesstoken?id=" + clientId + "&" + "secret=" + clientSecret, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Network response error : ${response.status}`);
    }
    const datas = await response.json();

    const spotifyApiInstance =  new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: 'https://example.org/callback',
      accessToken: datas,
    });
    setSpotifyApi(spotifyApiInstance);
  }

  useEffect(() => {
    getAccessToken(clientId, clientSecret);
  }, [])
  

  const findTracks = async (query: string) => {
    spotifyApi?.searchTracks(query)
    .then(function(data) {
      setTracks(data.body.tracks?.items);
      console.log(data.body.tracks);
    }, function(err) {
      console.error(err);
    });
  }


  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && !event.shiftKey && event.target.value.length > 0) {
      event.preventDefault();
      await findTracks(event.target.value);
    }
  };

  const getAudioData = async (url: string) => {
    const response = await fetch("http://localhost:5050/download?url=" + url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Network response error : ${response.status}`);
    }
    const datas = await response.json();
    console.log(datas);

    // Clean up the previous audio instance
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const newAudio = new Audio(datas);
    newAudio.volume = 0.2;
    setAudio(newAudio);
    setPaused(false);
  };

  const handlePlayPause = () => {
    if (audio.duration > 0) {
      if (paused) {
        audio.play();
      } else {
        audio.pause();
      }
      setPaused(!paused);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (!paused) {
      audio.play();
      const interval = setInterval(() => {
        setAudioPosition((audio.currentTime / audio.duration) * 100);
      }, 1000);

      audio.addEventListener('ended', () => {
        setPaused(true);
        clearInterval(interval);
        setAudioPosition(0);
      });

      return () => {
        clearInterval(interval);
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [audio]);

  return (
    <>
    <main className="bg-background min-h-screen w-screen flex flex-col">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"></link>
    <div className="mb-auto">
      <input type="text" placeholder='What do you want to play?' className="bg-third p-3 rounded-full text-sm pr-10 mb-5 w-fit text-white focus:outline-none focus:ring-white focus:ring-2 m-3" onKeyDown={handleKeyDown} />

      <div className="text-grays bg-primary rounded-lg mx-3 mb-20">
        {tracks.map((track: any, index: number) => {
          return (
            <div key={track.id} className="flex items-center p-3 rounded-xl hover:bg-third" onClick={async () => {
              getAudioData(track.name + " by " + track.artists[0].name);
              setTrack({
                name: track.name,
                artists: track.artists[0].name,
                album: track.album,
                thumbnail: track.album.images[0].url,
              });

            }}>
              <div className="font-semibold w-5 mr-3">{index + 1}</div>
              <img src={track.album.images[0].url} alt={track.name} className="w-14 h-14 rounded-lg" />
              <div className="ml-3 text-sm">
                <p className="text-white">{track.name}</p>
                <p className="text-grays">{track.artists[0].name}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    <footer className="text-white h-fit w-full bg-background flex font-sans mt-auto p-3 fixed bottom-0" onKeyDown={handleKeyDown}>
      {track && (
        <div className="flex items-center flex-grow text-sm w-auto absolute">
          <img src={track.thumbnail} alt={track.name} className="w-16 h-16 rounded-lg" />
          <div className="ml-3">
            <p className="text-white">{track.name}</p>
            <p className="text-grays">{track.artists}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="w-full items-center justify-center flex mb-1">
        {paused ?
          <FaPlayCircle size={40} color='#FFFFFF' className="hover:cursor-pointer" onClick={handlePlayPause} /> :
          <FaPauseCircle size={40} color='#FFFFFF' className="hover:cursor-pointer" onClick={handlePlayPause} />
        }
        </div>
        <div className="justify-center flex items-center">
          <div className="text-sm mx-3 text-grays">{formatTime(audio.currentTime)}</div>
          <div className="w-[30%] bg-gray-200 rounded-full h-1 dark:bg-gray-700 items-center">
            <div className="bg-white h-1 rounded-full dark:bg-white" style={{width: `${audioPosition}%`}}></div>
          </div>
          <div className="text-sm mx-3 text-grays">{formatTime(audio.duration)}</div>
        </div>
      </div>
    </footer>
    </main>
    </>
  )
}

export default App
