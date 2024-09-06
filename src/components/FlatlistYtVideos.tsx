import { useEffect, useState } from "react";
import { YoutubeAPIData } from "../@types";
import { v4 as uuidV4 } from "uuid";

export function FlatlistYtVideos() {
  const [videoData, setVideoData] = useState<YoutubeAPIData[]>([]);

  // GETTING YOUTUBE VIDEO LIST
  async function getYtVideos(): Promise<YoutubeAPIData[]> {
    return await fetch(
      `https://www.googleapis.com/youtube/v3/search?channelId=UCzR7iTraC0lmxCAIkEj5ANQ&order=date&part=snippet&type=video&maxResults=5&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
    )
      .then((data) => data.json())
      .then((list) => list.items);
  }

  // YOUTUBE DATA TRANSFORM FUNCTION
  const transformData = (data: YoutubeAPIData[]) => {
    return data.map((item: YoutubeAPIData) => {
      return item;
    });
  };

  // PUT TRANSFORMED YOUTUBE DATA ON STATE
  useEffect(() => {
    getYtVideos()
      .then((data) => {
        setVideoData(transformData(data));
      })
      .catch();
  }, []);

  return (
    <ul className="mb-16 w-full max-w-md overflow-auto">
      {videoData.map((item) => (
        <li key={uuidV4()}>
          <div className="mb-4 flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-md border-b-2 border-gray-500 bg-gray-200/90 p-4">
            <p className="text-center text-sm font-semibold text-red-600">
              {item.snippet.title}
            </p>
            <iframe
              className="aspect-video w-full max-w-md rounded-md"
              src={`https://www.youtube.com/embed/${item.id.videoId}?rel=0`}
              allowFullScreen
              title={item.snippet.title}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
