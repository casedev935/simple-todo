import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import { Dashboard } from './components/Dashboard';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
      <Toaster position="top-right" />
      {session ? (
        <Dashboard />
      ) : (
        <div className="glass p-8 rounded-2xl max-w-md w-full shadow-lg border border-white/10">
          <h1 className="text-3xl font-bold mb-4 text-center">To-Do App</h1>
          <Auth />
        </div>
      )}
    </div>
  );
}

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success('Logged in successfully!');
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error(error.message);
    else toast.success('Check your email for the login link!');
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-colors mt-4"
      >
        {loading ? 'Carregando...' : 'Login'}
      </button>
      <button
        type="button"
        onClick={handleSignUp}
        disabled={loading}
        className="w-full bg-transparent hover:bg-white/5 border border-brand-primary text-brand-primary font-bold py-2 px-4 rounded-xl transition-colors"
      >
        Criar conta
      </button>
    </form>
  );
}

export default App;
