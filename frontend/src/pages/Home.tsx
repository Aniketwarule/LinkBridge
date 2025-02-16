import { FaUserPlus, FaBriefcase, FaComments } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="space-y-8">
      <section className="bg-primary rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to LinkBridge</h1>
        <p className="text-xl text-gray-600">Connect, Learn, and Grow Professionally</p>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaUserPlus className="text-4xl text-accent mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect</h2>
          <p className="text-gray-600">Build your professional network with like-minded individuals</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaBriefcase className="text-4xl text-accent mb-4" />
          <h2 className="text-xl font-semibold mb-2">Opportunities</h2>
          <p className="text-gray-600">Discover job opportunities and career growth paths</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <FaComments className="text-4xl text-accent mb-4" />
          <h2 className="text-xl font-semibold mb-2">Engage</h2>
          <p className="text-gray-600">Share insights and participate in professional discussions</p>
        </div>
      </div>
    </div>
  );
}

export default Home;