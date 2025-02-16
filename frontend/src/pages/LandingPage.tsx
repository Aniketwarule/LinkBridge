import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Building2, Sparkles, Code, Briefcase } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const robotVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const circleVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const lineVariants = {
    initial: { pathLength: 0 },
    animate: {
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6  ">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <motion.h1
              className="text-6xl font-bold text-black leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Build Your
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="block"
              >
                Professional Bridge
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600"
              variants={itemVariants}
            >
              Connect, collaborate, and grow with professionals worldwide.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#000" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-900 transition-all"
            >
              Get Started
            </motion.button>
          </motion.div>

          <motion.div
            className="relative h-[400px]"
            initial="initial"
            animate="animate"
          >
            {/* Robot Animation */}
            <motion.div
              variants={robotVariants}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg width="400" height="400" viewBox="0 0 400 400">
                {/* Central Robot Head */}
                <motion.circle
                  cx="200"
                  cy="200"
                  r="60"
                  fill="#000"
                  variants={circleVariants}
                />
                <motion.circle
                  cx="200"
                  cy="200"
                  r="70"
                  stroke="#000"
                  strokeWidth="2"
                  fill="none"
                  variants={pulseVariants}
                />
               
                {/* Connection Lines */}
                {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                  <motion.path
                    key={index}
                    d={`M ${200 + Math.cos(angle * Math.PI / 180) * 70} ${200 + Math.sin(angle * Math.PI / 180) * 70}
                       L ${200 + Math.cos(angle * Math.PI / 180) * 150} ${200 + Math.sin(angle * Math.PI / 180) * 150}`}
                    stroke="#000"
                    strokeWidth="2"
                    fill="none"
                    variants={lineVariants}
                  />
                ))}
               
                {/* Connection Nodes */}
                {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                  <motion.circle
                    key={index}
                    cx={200 + Math.cos(angle * Math.PI / 180) * 150}
                    cy={200 + Math.sin(angle * Math.PI / 180) * 150}
                    r="10"
                    fill="#000"
                    variants={circleVariants}
                  />
                ))}
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 mt-24"
        >
          {[
            { icon: Users, title: "Expand Your Network", desc: "Connect with industry professionals" },
            { icon: Building2, title: "Access Opportunities", desc: "Discover career-changing possibilities" },
            { icon: TrendingUp, title: "Track Growth", desc: "Monitor your professional progress" }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <item.icon className="h-8 w-8 text-black mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-black">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-3xl font-bold text-black mb-4"
            >
              Accelerate Your Career
            </motion.h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Master in-demand skills with our comprehensive courses designed by industry experts
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Code,
                title: "Software Development",
                desc: "Master modern programming languages and frameworks",
                price: "$49.99",
                image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              },
              {
                icon: Briefcase,
                title: "Business Leadership",
                desc: "Develop essential management and leadership skills",
                price: "$59.99",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              },
              {
                icon: Sparkles,
                title: "Digital Marketing",
                desc: "Learn cutting-edge marketing strategies and tools",
                price: "$44.99",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              }
            ].map((course, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <course.icon className="h-6 w-6 text-black mr-2" />
                    <h3 className="text-xl font-semibold text-black">{course.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{course.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-black">{course.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors"
                    >
                      Enroll Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-3xl font-bold text-black"
            >
              Trusted by Leading Professionals
            </motion.h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            ].map((src, index) => (
              <motion.img
                key={index}
                src={src}
                alt={`Professional environment ${index + 1}`}
                className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;