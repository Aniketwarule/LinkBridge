import React, { useState } from 'react';
import { Building, Lock, Globe, MapPin, FileText, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { userState } from '../../store/atoms/user';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdBusiness } from 'react-icons/md';
import { BaseUrl } from '../../App';

function Cregister() {
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [password, setPassword] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const setUser = useSetRecoilState(userState);
    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${BaseUrl}/auth/company/register`, {
                name: companyName,
                email: companyEmail,
                password,
                industry,
                location,
                website,
                description,
            });

            if (response.data.token) {
                localStorage.setItem("token", "Bearer " + response.data.token);
                setUser({
                    isLoading: false,
                    userName: companyName,
                    isCompany: true,
                });
                setSuccess("Company registered successfully! Redirecting...");
                setTimeout(() => navigate('/company/dashboard'), 1500);
            }
        } catch (err) {
            console.log(err);
            setError("Company registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center' >
            <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdBusiness className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Register Your Company</h1>
                    <p className="text-gray-500 mt-2">Create a business account</p>
                </div>

                {error && <p className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">{error}</p>}
                {success && <p className="bg-green-100 text-green-600 p-3 rounded-lg text-sm text-center">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Company Name"
                        value={companyName}
                        onChange={setCompanyName}
                        icon={<Building className="text-gray-400" />}
                        placeholder="Enter company name"
                        required
                    />
                    <InputField
                        label="Company Email"
                        value={companyEmail}
                        onChange={setCompanyEmail}
                        icon={<MdEmail className="text-gray-400" />}
                        type="email"
                        placeholder="Enter company email"
                        required
                    />
                    <PasswordField
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                    />
                    <InputField
                        label="Industry"
                        value={industry}
                        onChange={setIndustry}
                        icon={<MdBusiness className="text-gray-400" />}
                        placeholder="E.g., Technology, Healthcare"
                    />
                    <InputField
                        label="Location"
                        value={location}
                        onChange={setLocation}
                        icon={<MapPin className="text-gray-400" />}
                        placeholder="City, Country"
                    />
                    <InputField
                        label="Website"
                        value={website}
                        onChange={setWebsite}
                        icon={<Globe className="text-gray-400" />}
                        placeholder="https://yourcompany.com"
                    />
                    <TextareaField
                        label="Company Description"
                        value={description}
                        onChange={setDescription}
                        icon={<FileText className="text-gray-400" />}
                        placeholder="Brief description of your company"
                    />

                    <button
                        type="submit"
                        className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Company'}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-500">Already registered?</span>{' '}
                    <button onClick={() => navigate('/login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, icon, type = "text", placeholder, required = false }: { label: string, value: string, onChange: (value: string) => void, icon: React.ReactNode, type?: string, placeholder?: string, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={placeholder}
                    required={required}
                />
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange, showPassword, togglePassword }: { label: string, value: string, onChange: (value: string) => void, showPassword: boolean, togglePassword: () => void }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-10 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter a secure password"
                    required
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={togglePassword}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </button>
            </div>
        </div>
    );
}

function TextareaField({ label, value, onChange, icon, placeholder }: { label: string, value: string, onChange: (value: string) => void, icon: React.ReactNode, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-3">{icon}</span>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={placeholder}
                    rows={3}
                />
            </div>
        </div>
    );
}

export default Cregister;
