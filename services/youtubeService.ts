import { Message } from '../types';

export const fetchYouTubePlaylist = async (
  playlistId: string,
  apiKey: string
): Promise<Message[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch playlist');
    }

    const data = await response.json();

    return data.items.map((item: any, index: number) => ({
      id: item.id,
      title: item.snippet.title,
      subtitle: item.snippet.description,
      date: new Date(item.snippet.publishedAt).toLocaleDateString('en-IN'),
      duration: '00:00',
      videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      videoId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
      createdAt: item.snippet.publishedAt,
      partNumber: index + 1
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
};

export const getMockVideos = (): Message[] => {
  return [
    {
      id: '1',
      title: 'Sunday Worship - The Grace of Faith',
      date: '2024-05-12',
      duration: '45:20',
      videoUrl: 'https://www.youtube.com/watch?v=3u05__FzYfw',
      videoId: '3u05__FzYfw',
      thumbnail: 'https://picsum.photos/seed/church1/400/400',
      createdAt: '2024-05-12',
      partNumber: 1
    },
    {
      id: '2',
      title: 'Family Meeting - The Importance of Love',
      date: '2024-05-10',
      duration: '38:15',
      videoUrl: 'https://www.youtube.com/watch?v=3u05__FzYfw',
      videoId: '3u05__FzYfw',
      thumbnail: 'https://picsum.photos/seed/church2/400/400',
      createdAt: '2024-05-10',
      partNumber: 2
    }
  ];
};