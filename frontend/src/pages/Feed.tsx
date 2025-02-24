import { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms/user';
import { BaseUrl } from '../App';

interface Comment {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface NewPost {
  description: string;
  imageUrl: string;
  author: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<NewPost>({
    description: '',
    imageUrl: '',
    author: ''
  });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const user = useRecoilValue(userState)

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/post/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(response.data);
      console.log(response.data)
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
      const response = await axios.post(`${BaseUrl}/post/`, 
        {
          description: newPost.description,
          image: newPost.imageUrl,
          author: user.userName
        },
        {
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      );

      setPosts(prevPosts => [response.data, ...prevPosts]);
      setNewPost({ description: '', imageUrl: '', author: ''});
    } catch (error) {
      console.log('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`${BaseUrl}/post/${postId}/like`, {}, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const userId = user.userName;
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
    if (!comment) return;

    try {
      const response = await axios.post(`${BaseUrl}/post/${postId}/comment`, 
        { text: comment },
        {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }
      );

      setPosts(prevPosts => {
        const post = prevPosts.find(post => post._id === postId);
        if (!post) return prevPosts;
        return [
          ...prevPosts.filter(post => post._id !== postId),
          {
            ...post,
            comments: [...post.comments, response.data]
          }
        ];
      });
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
              {post.author ? (
                <img 
                  src={post.author} 
                  alt={post.author} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white font-bold">
                  {post.author}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{post.author}</h3>
              {/* <p className="text-sm text-gray-500">{post.description}</p> */}
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-white mb-4">{post.description}</p>
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt="Post content" className="w-full rounded-lg" />
            </div>
          )}
          <div className="flex items-center space-x-6 text-gray-500 border-t pt-4">
            <button 
              onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-2 ${
                post.likes.includes(user.userName)  
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
                      {comment.user ? (
                        <img 
                          src={comment.user} 
                          alt={comment.user} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-white text-sm">
                          {comment.user}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-800 p-3 rounded-lg">
                      <p className="font-semibold text-gray-500 text-sm">{comment.user}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-white text-lg">{comment.text}</p>
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