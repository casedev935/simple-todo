import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Folder, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface List {
    id: string;
    title: string;
}

export function Sidebar({
    lists,
    activeListId,
    setActiveListId,
    fetchLists
}: {
    lists: List[],
    activeListId: string | null,
    setActiveListId: (id: string) => void,
    fetchLists: () => void
}) {
    const [newListTitle, setNewListTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('lists')
            .insert([{ title: newListTitle, user_id: user.id }])
            .select()
            .single();

        if (error) {
            toast.error('Error creating list');
        } else {
            toast.success('List created');
            setNewListTitle('');
            setIsCreating(false);
            fetchLists();
            if (!activeListId) setActiveListId(data.id);
        }
    };

    const setLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <aside className="w-64 bg-brand-card border-r border-white/5 h-screen flex flex-col pt-6 hidden md:flex backdrop-blur-md">
            <div className="px-6 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Folder className="text-brand-primary" />
                    Projects
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1">
                {lists.map((list) => (
                    <button
                        key={list.id}
                        onClick={() => setActiveListId(list.id)}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-all flex items-center gap-3 ${activeListId === list.id
                            ? 'bg-brand-primary/20 text-brand-primary font-semibold shadow-inner'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Folder size={18} />
                        <span className="truncate">{list.title}</span>
                    </button>
                ))}

                {isCreating ? (
                    <form onSubmit={handleCreateList} className="mt-2 px-2">
                        <input
                            type="text"
                            autoFocus
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="List name..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                            onBlur={() => !newListTitle && setIsCreating(false)}
                        />
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full text-left px-4 py-2 mt-2 rounded-xl text-brand-primary flex items-center gap-2 hover:bg-brand-primary/10 transition-colors text-sm font-medium"
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                )}
            </div>

            <div className="p-4 mt-auto border-t border-white/5">
                <button
                    onClick={setLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
