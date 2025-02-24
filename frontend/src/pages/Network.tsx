import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaUserPlus, FaEnvelope } from 'react-icons/fa';

interface Connection {
  id: number;
  name: string;
  username: string,
  title: string;
  avatar: string;
  profileImage?: string;
  mutualConnections: number;
}

const Network = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<string[]>([]);

  const fetchYouMayKnow = async () => {
    try {
      const response = await axios.get('http://localhost:3000/network/people-you-may-know', {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      console.log(data);
      setConnections(data.suggestions);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/network/connection-requests', {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      setConnectionRequests(data.connectionRequests);
      console.log(connectionRequests);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/network/pending-requests', {
        headers: {
          'Authorization': localStorage.getItem('token')
        },
      });
      const data = await response.data;
      console.log(data);
      setPendingRequests(data.pendingRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleConnectionRequest = (connection: Connection) => async () => {
    try {
      const res = await axios.post('http://localhost:3000/network/send-request', {
        recipientUsername: connection.username
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      console.log(res.data);
      setPendingRequests([...pendingRequests, connection.username]);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = (request: string) => async () => {
    try {
      const res = await axios.post('http://localhost:3000/network/accept-request', {
          requesterUsername: request
        }, {
          headers: {
            'Authorization': localStorage.getItem('token')
          },
        });

      console.log(res.data);
      if(res.status === 200) {
        const new_res = await axios.delete('http://localhost:3000/network/delete-connection', {
            data: {
              connectionUsername: request
            }, 
            headers: {
              'Authorization': localStorage.getItem('token')
            },
          });
        console.log(new_res.data);
      }
      console.log(res.data);
      // console.log(new_res.data);

      setConnectionRequests(prev => prev.filter(req => req !== request));
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };


  useEffect(() => {
    // Fetch connections and connection requests from the server
    fetchYouMayKnow();
  }, []);

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Network</h1>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-dark">127</div>
            <div className="text-gray-600">Connections</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-dark">45</div>
            <div className="text-gray-600">Profile Views</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">People you may know</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {connection.profileImage ? (
                  <img src={connection.profileImage} alt={connection.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-white font-bold">{connection.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{connection.name}</h3>
                <p className="text-sm text-gray-600">{connection.title}</p>
                <p className="text-xs text-gray-500">{connection.mutualConnections} mutual connections</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleConnectionRequest(connection)}
                className={`flex-1 flex items-center justify-center space-x-2 ${pendingRequests.includes(connection.username) ? 'bg-gray-300' : 'bg-accent hover:bg-dark'} text-white px-4 py-2 rounded-lg transition-colors`}
                disabled={connectionRequests && connectionRequests.includes(connection.username)}
              >
                <FaUserPlus />
                <span>{pendingRequests.includes(connection.username) ? 'Pending' : 'Connect'}</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <FaEnvelope />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">Pending Requests</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {connections.filter(connection => pendingRequests.includes(connection.username)).map((connection) => (
          <div key={connection.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {connection.profileImage ? (
                  <img src={connection.profileImage} alt={connection.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-white font-bold">{connection.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{connection.name}</h3>
                <p className="text-sm text-gray-600">{connection.title}</p>
                <p className="text-xs text-gray-500">{connection.mutualConnections} mutual connections</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">Connection Requests</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {connectionRequests.map((request) => (
          <div key={request} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {request ? (
                  <img src={request} alt={request} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-white font-bold">{request}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{request}</h3>
                <p className="text-sm text-gray-600">{request}</p>
                <p className="text-xs text-gray-500">{request} mutual connections</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={handleAcceptRequest(request)} className="flex-1 flex items-center justify-center space-x-2 bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg transition-colors">
                <FaUserPlus />
                <span>Accept</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <FaEnvelope />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Network;