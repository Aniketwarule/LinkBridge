import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  level: string;
  duration: string;
}

const Courses = () => {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: "Web Development Fundamentals",
      instructor: "John Doe",
      description: "Learn the basics of web development with HTML, CSS, and JavaScript",
      level: "Beginner",
      duration: "8 weeks"
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      instructor: "Jane Smith",
      description: "Master advanced React concepts and patterns",
      level: "Advanced",
      duration: "6 weeks"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Learning Hub</h1>
        <button className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" />
          Add Course
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-dark mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Instructor: {course.instructor}</span>
              <span>Level: {course.level}</span>
              <span>Duration: {course.duration}</span>
            </div>
            <button className="mt-4 bg-secondary hover:bg-accent text-white px-4 py-2 rounded-lg w-full">
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;