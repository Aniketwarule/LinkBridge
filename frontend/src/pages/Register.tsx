import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms/user';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const setUser = useSetRecoilState(userState);
    const navigate = useNavigate();

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        const response = await axios.post(`http://localhost:3000/auth/register`, {
            username: username,
            password: password,
            email: email,
        });

        if (response.data.token) {
            localStorage.setItem("token", "Bearer " + response.data.token);
            setUser({
                isLoading: false,
                userName: username,
            })
            navigate('/dashboard');
        }


        console.log('Login attempted with:', { username, password });
    };

    return (
        <div className='flex justify-center'>
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
                <p className="text-gray-500 mt-2">Please sign up to create new account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdEmail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="username"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                    Sign up
                </button>
            </form>

            <div className="text-center text-sm">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <button onClick={() => {
                    navigate('/login');
                }} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                </button>
            </div>
        </div>
        </div>
    );
}

export default Register;