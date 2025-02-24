import { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';
import axios from 'axios';

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: {
    _id: string;
    name: string;
    title: string;
    profileImage?: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface NewPost {
  description: string;
  imageUrl: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<NewPost>({
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.description.trim()) {
      alert('Please add a description to your post');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/posts', 
        {
          description: newPost.description,
          image: newPost.imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPosts(prevPosts => [response.data, ...prevPosts]);
      setNewPost({ description: '', imageUrl: '' });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`http://localhost:3000/posts/${postId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const userId = localStorage.getItem('userId');
            const isLiked = post.likes.includes(userId || '');
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== userId)
                : [...post.likes, userId || '']
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`http://localhost:3000/posts/${postId}/comment`, 
        { text: comment },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, comments: [...post.comments, response.data] }
            : post
        )
      );
      setComment('');
      setActiveCommentPost(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={localStorage.getItem('userImage') || ''} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="text"
            value={newPost.description}
            onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Share your thoughts..."
            className="flex-1 p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        {newPost.imageUrl && (
          <div className="relative mb-4">
            <img src={newPost.imageUrl} alt="Preview" className="w-full rounded-lg" />
            <button
              onClick={() => setNewPost(prev => ({ ...prev, imageUrl: '' }))}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex justify-between items-center border-t pt-4">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Enter image URL..."
              value={newPost.imageUrl}
              onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button 
            onClick={handleCreatePost}
            className="bg-accent hover:bg-dark text-white px-6 py-2 rounded-lg transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
              {post.author.profileImage ? (
                <img 
                  src={post.author.profileImage} 
                  alt={post.author.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white font-bold">
                  {post.author.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.author.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{post.description}</p>
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt="Post content" className="w-full rounded-lg" />
            </div>
          )}
          <div className="flex items-center space-x-6 text-gray-500 border-t pt-4">
            <button 
              onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-2 ${
                post.likes.includes(localStorage.getItem('userId') || '') 
                  ? 'text-accent' 
                  : 'hover:text-accent'
              }`}
            >
              <FaThumbsUp />
              <span>{post.likes.length}</span>
            </button>
            <button 
              onClick={() => setActiveCommentPost(post._id)}
              className="flex items-center space-x-2 hover:text-accent"
            >
              <FaComment />
              <span>{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-accent">
              <FaShare />
              <span>Share</span>
            </button>
          </div>

          {/* Comments Section */}
          {activeCommentPost === post._id && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={() => handleComment(post._id)}
                  className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg"
                >
                  Comment
                </button>
              </div>
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {comment.user.profileImage ? (
                        <img 
                          src={comment.user.profileImage} 
                          alt={comment.user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-white text-sm">
                          {comment.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm">{comment.user.name}</p>
                      <p className="text-gray-700">{comment.text}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Feed;