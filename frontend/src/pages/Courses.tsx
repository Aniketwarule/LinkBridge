import { useState } from 'react';
import { FaPlus, FaExternalLinkAlt } from 'react-icons/fa';

interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  level: string;
  duration: string;
  platform: string;
  enrollUrl: string;
  imageUrl?: string;
}

const Courses = () => {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: "Web Development Fundamentals",
      instructor: "John Doe",
      description: "Learn the basics of web development with HTML, CSS, and JavaScript",
      level: "Beginner",
      duration: "8 weeks",
      platform: "Udemy",
      enrollUrl: "https://www.udemy.com/course/the-web-developer-bootcamp/"
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      instructor: "Jane Smith",
      description: "Master advanced React concepts and patterns for building scalable applications",
      level: "Advanced",
      duration: "6 weeks",
      platform: "Udemy",
      enrollUrl: "https://www.udemy.com/course/react-redux/"
    },
    {
      id: 3,
      title: "The Complete JavaScript Course 2025",
      instructor: "Jonas Schmedtmann",
      description: "Master JavaScript with projects, challenges and theory. Learn modern JS from the beginning!",
      level: "All Levels",
      duration: "10 weeks",
      platform: "Udemy",
      enrollUrl: "https://www.udemy.com/course/the-complete-javascript-course/"
    },
    {
      id: 4,
      title: "Machine Learning Specialization",
      instructor: "Andrew Ng",
      description: "Build ML models with TensorFlow, use unsupervised learning methods, and more",
      level: "Intermediate",
      duration: "3 months",
      platform: "Coursera",
      enrollUrl: "https://www.coursera.org/specializations/machine-learning-introduction"
    },
    {
      id: 5,
      title: "Full Stack Development Cohort",
      instructor: "Harkirat Singh",
      description: "Comprehensive program covering frontend, backend, and devops with real-world projects",
      level: "Intermediate",
      duration: "6 months",
      platform: "100xDevs",
      enrollUrl: "https://100xdevs.com/"
    },
    {
      id: 6,
      title: "Data Science Professional Certificate",
      instructor: "IBM Team",
      description: "Develop skills in Python, SQL, data visualization, machine learning, and data analysis",
      level: "Beginner to Intermediate",
      duration: "11 courses, 5-6 months",
      platform: "Coursera",
      enrollUrl: "https://www.coursera.org/professional-certificates/ibm-data-science"
    },
    {
      id: 7,
      title: "The Complete 2025 Flutter Development Bootcamp",
      instructor: "Dr. Angela Yu",
      description: "Learn Flutter and Dart to build iOS and Android apps from scratch with hands-on projects",
      level: "Beginner",
      duration: "28 hours on-demand",
      platform: "Udemy",
      enrollUrl: "https://www.udemy.com/course/flutter-bootcamp-with-dart/"
    },
    {
      id: 8,
      title: "AWS Certified Solutions Architect",
      instructor: "Stephane Maarek",
      description: "Prepare for the AWS Certified Solutions Architect Associate certification",
      level: "Intermediate",
      duration: "25 hours",
      platform: "Udemy",
      enrollUrl: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/"
    },
    {
      id: 9,
      title: "DevOps Masterclass",
      instructor: "Sanjeev Thiyagarajan",
      description: "Learn CI/CD, Docker, Kubernetes, Jenkins, and more DevOps tools and practices",
      level: "Advanced",
      duration: "12 weeks",
      platform: "100xDevs",
      enrollUrl: "https://100xdevs.com/"
    },
    {
      id: 10,
      title: "Google UX Design Professional Certificate",
      instructor: "Google Team",
      description: "Design user experiences for products in organizations of all sizes",
      level: "Beginner",
      duration: "6 months",
      platform: "Coursera",
      enrollUrl: "https://www.coursera.org/professional-certificates/google-ux-design"
    }
  ]);

  const handleEnroll = (enrollUrl: string) => {
    // Open the URL in a new tab
    window.open(enrollUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Learning Hub</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-dark">{course.title}</h2>
              <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700">{course.platform}</span>
            </div>
            <p className="text-gray-600 mb-4 h-20 overflow-hidden">{course.description}</p>
            <div className="grid grid-cols-3 text-sm text-gray-500 gap-2 mb-4">
              <div>
                <p className="font-medium">Instructor</p>
                <p>{course.instructor}</p>
              </div>
              <div>
                <p className="font-medium">Level</p>
                <p>{course.level}</p>
              </div>
              <div>
                <p className="font-medium">Duration</p>
                <p>{course.duration}</p>
              </div>
            </div>
            <button 
              onClick={() => handleEnroll(course.enrollUrl)}
              className="mt-2 bg-secondary hover:bg-accent text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
            >
              Enroll Now <FaExternalLinkAlt className="ml-2" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;