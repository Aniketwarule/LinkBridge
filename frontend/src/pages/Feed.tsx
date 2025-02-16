import { useState } from 'react';
import axios from 'axios';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';

interface Post {
  id: number;
  author: {
    name: string;
    title: string;
    avatar: string;
    profileImage?: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: "John Doe",
        title: "Senior Software Engineer at Tech Corp",
        avatar: "JD",
        profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"
      },
      content: "Excited to share that I've just completed the Advanced React Patterns course on LinkBridge! The knowledge gained is invaluable. #Learning #React #WebDevelopment",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      likes: 42,
      comments: 8,
      timestamp: "2h ago"
    }
  ]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(e.target.value);
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Title and description are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/post/create', {
        title,
        description,
        image: imagePreview,
        category,
      });

      if (response.data) {
        setPosts((prevPosts) => [...prevPosts, response.data]);
        setTitle('');
        setDescription('');
        setImagePreview(null);
        setCategory('');
      }
    } catch (e) {
      console.error('Failed to create post:', e);
      alert('Failed to create post');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
            {posts[0]?.author.profileImage ? (
              <img src={posts[0].author.profileImage} alt={posts[0].author.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold">{posts[0].author.avatar}</span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title..."
            className="flex-1 p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {imagePreview && (
          <div className="relative mb-4 mt-2">
            <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex justify-between items-center border-t pt-4 gap-4">
          <input
            type="text"
            value={imagePreview || ''}
            placeholder="Paste image URL..."
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handlePost}
            className="bg-accent hover:bg-dark text-white px-6 py-2 rounded-lg transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
              {post.author.profileImage ? (
                <img src={post.author.profileImage} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold">{post.author.avatar}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.author.title}</p>
              <p className="text-xs text-gray-400">{post.timestamp}</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{post.content}</p>
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt="Post content" className="w-full rounded-lg" />
            </div>
          )}
          <div className="flex items-center space-x-6 text-gray-500 border-t pt-4">
            <button className="flex items-center space-x-2 hover:text-accent">
              <FaThumbsUp />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-accent">
              <FaComment />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-accent">
              <FaShare />
              <span>Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
