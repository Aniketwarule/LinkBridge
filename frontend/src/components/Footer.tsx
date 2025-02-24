import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-12">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* ✅ Brand Section */}
          <div>
            <h2 className="text-2xl font-bold">LinkBridge</h2>
            <p className="text-gray-400 text-sm mt-2">
              Connecting talent with opportunities.
            </p>
          </div>

          {/* ✅ Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/jobs" className="text-gray-400 hover:text-white">Jobs</Link></li>
              <li><Link to="/network" className="text-gray-400 hover:text-white">Network</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-white">Courses</Link></li>
            </ul>
          </div>

          {/* ✅ Contact Section */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
            <p className="text-gray-400 text-sm">support@linkbridge.com</p>
            <p className="text-gray-400 text-sm">CSMSS College of Polytechnic, Aurangabad, Maharashtra
               </p>
          </div>
        </div>

        {/* ✅ Copyright Section */}
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} LinkBridge. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
