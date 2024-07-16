import { useEffect, useState } from 'react'
import axios from 'axios';
import { FaPlayCircle, FaPauseCircle, FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa';
import { IoPlayCircleSharp, IoPauseCircleSharp, IoPlaySkipForwardSharp, IoPlaySkipBackSharp } from "react-icons/io5";
import SpotifyWebApi from 'spotify-web-api-node';
import { LuClock3 } from "react-icons/lu";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";

import { ScaleLoader } from 'react-spinners';
import LeftSideBar from './components/LeftSideBar';
// import './App.css'

interface Track {
  id: string;
  name: string;
  artists: any;
  album: any;
  thumbnail: string;
}

const App = () => {
  const [audio, setAudio] = useState<any | null>(new Audio());
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [paused, setPaused] = useState<boolean>(true);
  const [tracks, setTracks] = useState<any | null>([]);
  const [selectedTab, setSelectedTab] = useState<string>('songs');
  const [query, setQuery] = useState<string>('');
  const [playlists, setPlaylists] = useState<any | null>([]);
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
      setQuery(query);
    }, function(err) {
      console.error(err);
    });
  }
  const findPlaylist = async (query: string) => {
    spotifyApi?.searchPlaylists(query)
    .then(function(data) {
      setPlaylists(data.body.playlists?.items);
      console.log(data.body.playlists);
    }, function(err) {
      console.error(err);
    });
  }


  const handleKeyDown = async (event: any) => {
    if (event.key === "Enter" && !event.shiftKey && event.target.value.length > 0) {
      event.preventDefault();
      if (selectedTab === 'songs') {
        await findTracks(event.target.value);
      }
      else if (selectedTab === 'playlists') {
        await findPlaylist(event.target.value);
      }
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

  const handleSeek = (pos: number) => {
    if (audio.duration > 0) {
      audio.fastSeek(audio.duration * pos);
    }
  }

  const formatTime = (seconds: number): string => {
    if (!seconds) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatString = (str: string, length: number): string => {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  useEffect(() => {
    if (!paused) {
      audio.play();
      const interval = setInterval(() => {
        setAudioPosition((audio.currentTime / audio.duration) * 100);
      }, 100);

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
    <LeftSideBar />
    <div className="ml-[35vh] my-2">
    <div className="mb-auto flex flex-col mx-4 bg-primary rounded-lg">
      <div className="flex flex-col">
      <div className="flex flex-row items-center mb-2 ml-5">
        <div className="rounded-full border-black box-border bg-grays w-6 h-6 mr-4 flex justify-center items-center hover:cursor-pointer">
          <IoIosArrowDropleftCircle size={40} color='black' lightingColor='black' className="absolute rounded-full" />
        </div>
        <div className="rounded-full border-black box-border bg-grays w-6 h-6 mr-1.5 flex justify-center items-center hover:cursor-pointer">
          <IoIosArrowDroprightCircle size={40} color='black' className="absolute rounded-full" />
        </div>
        <input type="text" placeholder='What do you want to play?' className="bg-third p-3 rounded-full text-sm pr-20 w-fit text-white focus:outline-none focus:ring-white focus:ring-2 m-2 ml-4" onKeyDown={handleKeyDown} />
      </div>
      {query.length > 0 && (
      <div className="flex flex-row">
        <button className={`bg-third rounded-full py-2 px-3 text-sm w-fit ml-4 mb-3 ${selectedTab === 'all' ? 'bg-white text-black' : 'hover:bg-gray-800 text-white'}`}
          onClick={() => {
            findPlaylist(query);
            setSelectedTab('all');
          }}>
            All
        </button>
        <button className={`bg-third rounded-full py-2 px-3 text-sm w-fit ml-3 mb-3 ${selectedTab === 'songs' ? 'bg-white text-black' : 'hover:bg-gray-800 text-white'}`}
          onClick={() => {
            findTracks(query);
            setSelectedTab('songs');
          }}>
            Songs
        </button>
        <button className={`bg-third rounded-full py-2 px-3 text-sm w-fit ml-3 mb-3 ${selectedTab === 'playlists' ? 'bg-white text-black' : 'hover:bg-gray-800 text-white'}`}
          onClick={() => {
            findPlaylist(query);
            setSelectedTab('playlists');
          }}>
            Playlists
        </button>
      </div>
      )}
      <div className="flex w-full bg-secondary border-third border-b-2 text-grays text-sm py-2 px-8 pr-16 whitespace-nowrap items-center">
        <div className="mr-[32rem]">{"# Title"}</div>
        <div className="mr-[32rem]">{"Album"}</div>
        <div className="w-full flex justify-end"><LuClock3 size={18} color='#A7A7A7'/></div>
      </div>
      <div className="text-grays bg-primary rounded-lg mx-3 my-2 ml-4 mb-20">
        {selectedTab === 'songs' && (
          tracks.map((track: any, index: number) => {
            return (
              <div key={track.id} className={`flex items-center px-5 py-2 rounded-xl hover:bg-third hover:text-white ${currentTrack?.id === track.id && "bg-secondary"}`} onClick={async () => {
                getAudioData(track.name + " by " + track.artists[0].name);
                setCurrentTrack({
                  id: track.id,
                  name: track.name,
                  artists: track.artists[0].name,
                  album: track.album,
                  thumbnail: track.album.images[0].url,
                });

              }}>
                <div className="font-semibold w-5 mr-3 hover:cursor-default">{index + 1}</div>
                <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded-lg" />
                <div className="ml-3 text-sm w-[28rem]">
                  <p className="text-white whitespace-nowrap hover:cursor-default">{formatString(track.name, 50)}</p>
                  <a className="text-grays hover:underline" href={track.artists[0].external_urls?.spotify}>{track.artists[0].name}</a>
                </div>
                <div className="pl-3 text-grays text-sm">
                  <a href={track.album.external_urls?.spotify} className="hover:underline">{track.album.name}</a>
                </div>
                <div className="flex flex-grow justify-end text-sm mr-[1.5rem]">
                  {currentTrack?.id === track.id ? 
                  <ScaleLoader color='#A7A7A7' loading={true} height={20} width={4} speedMultiplier={0.75} margin={1.5}/> : 
                  <p className="text-grays">{formatTime(track.duration_ms / 1000)}</p>}
                </div>
              </div>
            )
          })
        )}
        {selectedTab === 'playlists' && (<div className="flex flex-wrap items-center p-3 rounded-xl">{
          playlists.map((playlist: any) => {
            return (
              <div key={playlist.id} className={`flex flex-col p-3 rounded-xl hover:bg-third hover:cursor-pointer ${currentTrack?.id === playlist.id && "bg-secondary"}`} onClick={async () => {
                // getAudioData(playlist.name);
                // setCurrentTrack({
                //   id: playlist.id,
                //   name: playlist.name,
                //   artists: playlist.owner.display_name,
                //   album: playlist.images[0],
                //   thumbnail: playlist.images[0].url,
                // });

              }}> 
                <img src={playlist.images[0].url} alt={playlist.name} className="w-40 h-40 rounded-lg mb-3" />
                <div className="text-sm">
                  <p className="text-white">{formatString(playlist.name, 18)}</p>
                  <p className="text-grays">By {formatString(playlist.owner.display_name, 12)}</p>
                </div>
                <div className="flex flex-grow text-sm">
                  {currentTrack?.id === playlist.id ? 
                  <ScaleLoader color='#A7A7A7' loading={true} height={20} width={4} speedMultiplier={0.75} margin={1.5}/> : 
                  <p className="text-grays">{playlist.tracks.total} songs</p>}
                </div>
              </div>
            )
          })
        }</div>)}
      </div>
      </div>
      </div>
    </div>
    <footer className="text-white h-fit w-full bg-background flex font-sans mt-auto p-3 fixed bottom-0" onKeyDown={handleKeyDown}>
      {currentTrack && (
        <div className="flex items-center flex-grow text-sm w-auto absolute">
          <img src={currentTrack.thumbnail} alt={currentTrack.name} className="w-16 h-16 rounded-lg" />
          <div className="ml-3">
            <p className="text-white">{currentTrack.name}</p>
            <p className="text-grays">{currentTrack.artists}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="w-full items-center justify-center flex mb-1">
        <IoPlaySkipBackSharp size={20} color='#FFFFFF' className=" mr-4 hover:cursor-pointer"/>
        {paused ?
          <IoPlayCircleSharp size={40} color='#FFFFFF' className="hover:cursor-pointer" onClick={handlePlayPause} /> :
          <IoPauseCircleSharp size={40} color='#FFFFFF' className="hover:cursor-pointer" onClick={handlePlayPause} />
        }
        <IoPlaySkipForwardSharp size={20} color='#FFFFFF' className=" ml-4 hover:cursor-pointer"/>
        </div>

        {/* Progress Bar */}
        <div className="justify-center flex items-center">
          <div className="text-xs mr-3 text-grays w-[3rem] text-center">{formatTime(audio.currentTime)}</div>
          <div className="w-[60vh] bg-gray-200 rounded-full h-1 dark:bg-lightgrays items-center" onClick={(event) => {
            const x = (event.clientX - ((screen.width - event.currentTarget.offsetWidth) / 2)) / event.currentTarget.offsetWidth;
            handleSeek(x);
          }}>
            <div className="bg-white h-1 rounded-full dark:bg-white" style={{width: `${audioPosition}%`}}></div>
          </div>
          <div className="text-xs ml-3 text-grays w-[3rem] text-center">{formatTime(audio.duration)}</div>
        </div>
      </div>
      
    </footer>
    </main>
    </>
  )
}

export default App
