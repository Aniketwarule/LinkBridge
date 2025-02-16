import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { userState } from '../store/atoms/user';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const setUser = useSetRecoilState(userState) 
    const navigate = useNavigate()

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempted with:', { username, password });

        const res = await axios.post(`http://localhost:3000/auth/login`, {
            username,
            password,
        });

        if (res.data) {
            console.log('Login successful');
            setUser({
                userName: username,
                isLoading: false,
            })
            localStorage.setItem("token", "Bearer " + res.data.token);
            navigate('/dashboard');
        } else {
            console.log('Login failed');
            alert('Invalid username or password');
        }
    };

    return (
        <div className='flex justify-center'>
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 mt-2">Please sign in to your account</p>
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
                            placeholder="Enter your name"
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
                    <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                    Sign in
                </button>
            </form>

            <div className="text-center text-sm">
                <span className="text-gray-500">Don't have an account?</span>{' '}
                <button onClick={() => {
                    navigate('/register')
                }} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </button>
            </div>
        </div>
        </div>
    );
}

export default Login;