import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { TaskItem } from './TaskItem';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Search, Menu } from 'lucide-react';

interface List {
    id: string;
    title: string;
}

interface Task {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    order_index: number;
}

export function Dashboard() {
    const [lists, setLists] = useState<List[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

    const fetchLists = async () => {
        const { data } = await supabase.from('lists').select('*').order('created_at');
        if (data) {
            setLists(data);
            if (data.length > 0 && !activeListId) {
                setActiveListId(data[0].id);
            }
        }
    };

    const fetchTasks = async () => {
        if (!activeListId) return;
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('list_id', activeListId)
            .order('order_index', { ascending: true });

        if (data) setTasks(data);
    };

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [activeListId]);

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for smooth UI
        const updatedTasks = items.map((t, index) => ({ ...t, order_index: index }));
        setTasks(updatedTasks);

        // Persist to Supabase
        const updates = updatedTasks.map(t => ({
            id: t.id,
            list_id: t.list_id,
            order_index: t.order_index
        }));

        await supabase.from('tasks').upsert(updates);
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim() || !activeListId) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('tasks').insert([{
            ...newTask,
            list_id: activeListId,
            user_id: user.id,
            status: 'pending',
            order_index: tasks.length
        }]);

        if (!error) {
            setShowTaskForm(false);
            setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
            fetchTasks();
        }
    };

    const activeList = lists.find(l => l.id === activeListId);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending' && task.status === 'completed') return false;
        if (filter === 'completed' && task.status !== 'completed') return false;
        if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="flex h-screen bg-brand-dark w-full overflow-hidden">
            <Sidebar lists={lists} activeListId={activeListId} setActiveListId={setActiveListId} fetchLists={fetchLists} />

            <main className="flex-1 flex flex-col h-full bg-[#0b1121]">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-brand-card/30 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400 hover:text-white"><Menu /></button>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary to-brand-primary">
                            {activeList ? activeList.title : 'Select a Project'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <Search className="absolute left-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all w-64"
                        />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">

                    {activeList && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                                    {['all', 'pending', 'completed'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f as any)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="tasks">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                            {filteredTasks.map((task, index) => (
                                                <TaskItem key={task.id} task={task} index={index} fetchTasks={fetchTasks} />
                                            ))}
                                            {provided.placeholder}
                                            {filteredTasks.length === 0 && (
                                                <div className="text-center py-12 text-gray-500">
                                                    No tasks found. Create a new one to get started!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    )}

                    {/* Fab Button */}
                    {activeList && !showTaskForm && (
                        <button
                            onClick={() => setShowTaskForm(true)}
                            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-brand-primary/20 hover:scale-105 transition-all z-10"
                        >
                            <Plus size={28} />
                        </button>
                    )}

                    {/* Task Form Modal overlay */}
                    {showTaskForm && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="glass p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                                <h3 className="text-xl font-bold mb-4">New Task</h3>
                                <form onSubmit={handleCreateTask} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Task Title"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                    <textarea
                                        placeholder="Description (optional)"
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none h-24 resize-none"
                                    />
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Priority</label>
                                            <select
                                                value={newTask.priority}
                                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none text-white appearance-none"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                value={newTask.due_date}
                                                onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none text-white color-scheme-dark"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowTaskForm(false)}
                                            className="px-5 py-2 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-blue-600 transition-colors font-semibold"
                                        >
                                            Save Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
