import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaUserPlus, FaEnvelope } from 'react-icons/fa';
import { BaseUrl } from '../App';

interface Connection {
  id: number;
  name: string;
  username: string,
  title: string;
  avatar: string;
  profileImage?: string;
  mutualConnections: number;
}

interface UserProfile {
  username?: string;
  name?: string;
  userName?: string;
  profilePicture?: string;
}

const Network = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<string[]>([]);
  const [myConnections, setMyConnections] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  // Default profile picture
  const defaultProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

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

  const getProfilePicture = (username: string) => {
    return userProfiles[username]?.profilePicture || defaultProfilePic;
  };

  const fetchYouMayKnow = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/network/people-you-may-know`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      console.log('People you may know:', data);
      setConnections(data.suggestions);
      
      // Fetch profile pictures for each suggested connection
      data.suggestions.forEach((connection: Connection) => {
        fetchUserProfile(connection.username);
      });
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/network/connection-requests`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      setConnectionRequests(data.connectionRequests);
      console.log('Connection requests:', data.connectionRequests);
      
      // Fetch profile pictures for each connection request
      data.connectionRequests.forEach((username: string) => {
        fetchUserProfile(username);
      });
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/network/pending-requests`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      console.log('Pending requests:', data);
      setPendingRequests(data.pendingRequests);
      
      // Fetch profile pictures for each pending request
      data.pendingRequests.forEach((username: string) => {
        fetchUserProfile(username);
      });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchMyConnections = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/network/connections`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      console.log('My connections:', data);
      setMyConnections(data.connections);
      
      // Fetch profile pictures for each connection
      data.connections.forEach((username: string) => {
        fetchUserProfile(username);
      });
    } catch (error) {
      console.error('Error fetching my connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRequest = (connection: Connection) => async () => {
    try {
      const res = await axios.post(`${BaseUrl}/network/send-request`, {
        recipientUsername: connection.username
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      console.log('Send request response:', res.data);
      setPendingRequests([...pendingRequests, connection.username]);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = (request: string) => async () => {
    try {
      const res = await axios.post(`${BaseUrl}/network/accept-request`, {
        requesterUsername: request
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });

      console.log('Accept request response:', res.data);
      
      if (res.status === 200) {
        // Remove from connection requests
        setConnectionRequests(prev => prev.filter(req => req !== request));
        
        // Add to my connections
        setMyConnections(prev => [...prev, request]);
        
        // Refresh all data to ensure consistency
        fetchMyConnections();
        fetchConnectionRequests();
        fetchYouMayKnow();
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRemoveConnection = (connectionUsername: string) => async () => {
    try {
      const res = await axios.delete(`${BaseUrl}/network/delete-connection`, {
        data: {
          connectionUsername: connectionUsername
        }, 
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      
      console.log('Remove connection response:', res.data);
      
      if (res.status === 200) {
        setMyConnections(prev => prev.filter(conn => conn !== connectionUsername));
        fetchYouMayKnow();
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  useEffect(() => {
    // Fetch all network data initially
    fetchYouMayKnow();
    fetchConnectionRequests();
    fetchPendingRequests();
    fetchMyConnections();
  }, []);

  if (loading) {
    return <div className="text-center py-8 dark:text-white">Loading network...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Network</h1>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-dark">{myConnections.length}</div>
            <div className="text-gray-600">Connections</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-dark">{connectionRequests.length}</div>
            <div className="text-gray-600">Connection Requests</div>
          </div>
        </div>
      </div>

      {connectionRequests.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-8">Connection Requests</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {connectionRequests.map((request) => (
              <div key={request} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {getProfilePicture(request) !== defaultProfilePic ? (
                      <img src={getProfilePicture(request)} alt={request} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl text-white font-bold">{request.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{request}</h3>
                    <p className="text-xs text-gray-500">Wants to connect with you</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={handleAcceptRequest(request)} 
                    className="flex-1 flex items-center justify-center space-x-2 bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaUserPlus />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">People you may know</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {getProfilePicture(connection.username) !== defaultProfilePic ? (
                  <img src={getProfilePicture(connection.username)} alt={connection.name} className="w-full h-full object-cover" />
                ) : connection.profileImage ? (
                  <img src={connection.profileImage} alt={connection.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-white font-bold">{connection.name?.charAt(0) || connection.username.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{connection.name || connection.username}</h3>
                <p className="text-sm text-gray-600">{connection.title || 'No title'}</p>
                <p className="text-xs text-gray-500">{connection.mutualConnections || 0} mutual connections</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleConnectionRequest(connection)}
                className={`flex-1 flex items-center justify-center space-x-2 
                  ${pendingRequests.includes(connection.username) 
                    ? 'bg-gray-300' 
                    : myConnections.includes(connection.username)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-accent hover:bg-dark'
                  } 
                  text-white px-4 py-2 rounded-lg transition-colors`}
                disabled={pendingRequests.includes(connection.username) || myConnections.includes(connection.username)}
              >
                <FaUserPlus />
                <span>
                  {pendingRequests.includes(connection.username) 
                    ? 'Pending' 
                    : myConnections.includes(connection.username)
                      ? 'Connected'
                      : 'Connect'
                  }
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingRequests.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-8">Pending Requests</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {connections
              .filter(connection => pendingRequests.includes(connection.username))
              .map((connection) => (
                <div key={connection.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {getProfilePicture(connection.username) !== defaultProfilePic ? (
                        <img src={getProfilePicture(connection.username)} alt={connection.name} className="w-full h-full object-cover" />
                      ) : connection.profileImage ? (
                        <img src={connection.profileImage} alt={connection.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl text-white font-bold">{connection.name?.charAt(0) || connection.username.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{connection.name || connection.username}</h3>
                      <p className="text-sm text-gray-600">{connection.title || 'No title'}</p>
                      <p className="text-xs text-gray-500">{connection.mutualConnections || 0} mutual connections</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {myConnections.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 mt-8">My Connections</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {myConnections.map((connection) => (
              <div key={connection} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {getProfilePicture(connection) !== defaultProfilePic ? (
                      <img src={getProfilePicture(connection)} alt={connection} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl text-white font-bold">{connection.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{connection}</h3>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleRemoveConnection(connection)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>Remove Connection</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Network;