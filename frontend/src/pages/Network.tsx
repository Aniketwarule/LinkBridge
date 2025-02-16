import { useState } from 'react';
import { FaUserPlus, FaEnvelope } from 'react-icons/fa';

interface Connection {
  id: number;
  name: string;
  title: string;
  avatar: string;
  profileImage?: string;
  mutualConnections: number;
}

const Network = () => {
  const [connections] = useState<Connection[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      title: "UX Designer at Design Co",
      avatar: "SJ",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      mutualConnections: 12
    },
    {
      id: 2,
      name: "Mike Wilson",
      title: "Software Engineer at Tech Solutions",
      avatar: "MW",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      mutualConnections: 8
    }
  ]);

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
              <button className="flex-1 flex items-center justify-center space-x-2 bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg transition-colors">
                <FaUserPlus />
                <span>Connect</span>
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

export default Network