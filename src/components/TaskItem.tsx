import { CheckCircle2, Circle, Clock, GripVertical, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
}

export function TaskItem({ task, index, fetchTasks }: { task: Task, index: number, fetchTasks: () => void }) {
    const isCompleted = task.status === 'completed';
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

    const toggleStatus = async () => {
        const newStatus = isCompleted ? 'pending' : 'completed';
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
        if (error) toast.error('Error updating task');
        else fetchTasks();
    };

    const priorityColors: Record<string, string> = {
        high: 'bg-red-500/20 text-red-500 border-red-500/30',
        medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        low: 'bg-green-500/20 text-green-500 border-green-500/30',
    };

    const priorityBadge = priorityColors[task.priority.toLowerCase()] || priorityColors.low;

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`glass p-4 rounded-xl mb-3 flex items-center gap-4 transition-all ${isCompleted ? 'opacity-60' : ''}`}
                >
                    <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab">
                        <GripVertical size={20} />
                    </div>

                    <button onClick={toggleStatus} className="text-brand-secondary hover:text-white transition-colors">
                        {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>

                    <div className="flex-1">
                        <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-sm text-gray-400 mt-1 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                                {task.priority.toUpperCase()}
                            </span>
                            {task.due_date && (
                                <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                                    <Clock size={12} />
                                    {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this task?')) {
                                await supabase.from('tasks').delete().eq('id', task.id);
                                fetchTasks();
                                toast.success('Task deleted');
                            }
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )}
        </Draggable>
    );
}
