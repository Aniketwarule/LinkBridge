import { useState, useEffect, useRef } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaLink, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms/user';
import { BaseUrl } from '../App';

interface Comment {
  _id: string;
  user: string;
  text: string;
  prof: string;
  createdAt: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: string;
  authorProfilePic?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface NewPost {
  description: string;
  imageUrl: string;
  author: string;
}

interface UserProfile {
  username?: string;
  name?: string;
  userName?: string;
  profilePicture?: string;
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
  const [activeSharePost, setActiveSharePost] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const user = useRecoilValue(userState);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts();
    
    // Close share menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setActiveSharePost(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (shareSuccess) {
      const timer = setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [shareSuccess]);

  const fetchUserProfile = async (username: string) => {
    // Skip if we already have this user's profile
    if (userProfiles[username]) return userProfiles[username];

    try {
      const response = await axios.get(`${BaseUrl}/working/getUserProfile/${username}`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      const profile = response.data;
      setUserProfiles(prev => ({
        ...prev,
        [username]: profile
      }));
      
      return profile;
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      return null;
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/post/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const postsData = response.data;
      setPosts(postsData);
      
      // Fetch profile pictures for post authors
      const authors = new Set(postsData.map((post: Post) => post.author));
      
      // For each unique author, fetch their profile
      authors.forEach((author: string) => {
        fetchUserProfile(author);
      });
      
      // For comments, fetch profile pics for commenters too
      postsData.forEach((post: Post) => {
        post.comments.forEach((comment: Comment) => {
          fetchUserProfile(comment.user);
        });
      });
      
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

      // Add the current user's profile pic to the new post
      const newPostWithProfile = {
        ...response.data,
        authorProfilePic: userProfiles[user.userName]?.profilePicture
      };

      setPosts(prevPosts => [newPostWithProfile, ...prevPosts]);
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

      // Get the current user's profile image to add to the comment
      const currentUserProfile = userProfiles[user.userName];
      const commentWithProfile = {
        ...response.data,
        prof: currentUserProfile?.profilePicture
      };

      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, commentWithProfile]
            };
          }
          return post;
        });
        return updatedPosts;
      });
      
      setComment('');
      setActiveCommentPost(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = (postId: string) => {
    setActiveSharePost(activeSharePost === postId ? null : postId);
  };

  const shareToSocialMedia = (platform: string, postId: string) => {
    // Get the current post
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    
    // Generate post URL - this would be your actual post URL
    const postUrl = `${window.location.origin}/post/${postId}`;
    const text = `Check out this post by ${post.author}: ${post.description.substring(0, 50)}${post.description.length > 50 ? '...' : ''}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + postUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Check out this post')}&body=${encodeURIComponent(text + '\n\n' + postUrl)}`;
        break;
      case 'copy':
        // Copy to clipboard
        navigator.clipboard.writeText(postUrl).then(() => {
          setShareSuccess(true);
        });
        setActiveSharePost(null);
        return;
    }
    
    // Open share dialog
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      setActiveSharePost(null);
    }
  };

  const getProfilePicture = (username: string) => {
    return userProfiles[username]?.profilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  };

  const defaultProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  if (loading) {
    return <div className="text-center py-8 dark:text-white">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {shareSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
          Link copied to clipboard!
        </div>
      )}
      
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={getProfilePicture(user.userName) || defaultProfilePic} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="text"
            value={newPost.description}
            onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Share your thoughts..."
            className="flex-1 p-3 border dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
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
        <div className="flex justify-between items-center border-t dark:border-gray-700 pt-4">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Enter image URL..."
              value={newPost.imageUrl}
              onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
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
        <div key={post._id} className="bg-white rounded-md shadow-md p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={getProfilePicture(post.author)} 
                alt={post.author} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{post.author}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white mb-4">{post.description}</p>
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt="Post content" className="w-full rounded-lg" />
            </div>
          )}
          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
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
            <div className="relative">
              <button 
                onClick={() => handleShare(post._id)}
                className="flex items-center space-x-2 hover:text-accent"
              >
                <FaShare />
                <span>Share</span>
              </button>
              
              {/* Share Menu */}
              {activeSharePost === post._id && (
                <div 
                  ref={shareMenuRef} 
                  className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-10"
                >
                  <div className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    Share to:
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => shareToSocialMedia('facebook', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaFacebook className="text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    <button 
                      onClick={() => shareToSocialMedia('twitter', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaTwitter className="text-blue-400" />
                      <span>Twitter</span>
                    </button>
                    <button 
                      onClick={() => shareToSocialMedia('linkedin', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaLinkedin className="text-blue-700" />
                      <span>LinkedIn</span>
                    </button>
                    <button 
                      onClick={() => shareToSocialMedia('whatsapp', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaWhatsapp className="text-green-500" />
                      <span>WhatsApp</span>
                    </button>
                    <button 
                      onClick={() => shareToSocialMedia('email', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaEnvelope className="text-gray-500" />
                      <span>Email</span>
                    </button>
                    <button 
                      onClick={() => shareToSocialMedia('copy', post._id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaLink className="text-gray-500" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {activeCommentPost === post._id && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
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
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={comment.prof || getProfilePicture(comment.user) || defaultProfilePic} 
                        alt={comment.user} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{comment.user}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.text}</p>
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