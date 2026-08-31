import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, company });
      await login(email, password);
      toast.success('Account created. Welcome to Helpdesk.');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Get started with your free trial</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant invitation or company ID</label>
              <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)}
                className="mt-1 input-field" placeholder="Provided by your organisation administrator" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 input-field" placeholder="8+ characters" minLength={8} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-500 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
