'use client';

import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "task-list";
type Task = { id: number; text: string; done: boolean };

export const TaskList = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [text, setText] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() === "") return;
        const newTask: Task = { id: Date.now(), text: text.trim(), done: false };
        setTasks((prev) => [...prev, newTask]);
        setText("");
        inputRef.current?.focus();
    }

    const clearAllTasks = () => {
        localStorage.removeItem(STORAGE_KEY);
        setTasks([]);
    }

    useEffect(() => { //useLayoutEffect 
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                if (Array.isArray(parsed)) setTasks(parsed);

                /* can skip cascading rendering by this code as well */

                // queueMicrotask(() => {
                //     setTasks(parsed);
                // });
            } catch (error) {
                console.error("Failed to parse tasks:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            } catch (e) {
                console.error("Failed to save tasks:", e);
            }
        }
    }, [tasks]);

    const toggleTaskDone = (id: number) => {
        setTasks((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }

    const deleteTask = (id: number) => {
        const updatedTasks = tasks.filter((t) => t.id !== id);
        setTasks(updatedTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans p-6">
            <main className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                <header className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Task Tracker</h1>
                    </div>
                    <div className="text-right text-sm text-zinc-600 dark:text-zinc-300">
                        <div>{tasks.length} total</div>
                    </div>
                </header>

                <form className="mb-4 flex gap-2" onSubmit={addTask}>
                    <input
                        ref={inputRef}
                        className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
                        placeholder="Add a new task and press Enter"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        aria-label="New task"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-95 disabled:opacity-50"
                        disabled={!text.trim()}
                    >
                        Add Task
                    </button>
                </form>

                <section>
                    {tasks.length === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            No tasks added yet. Start by adding a new task above.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {tasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => toggleTaskDone(task.id)}
                                            aria-label={`Mark ${task.text} as ${task.done ? "not done" : "done"}`}
                                            className="h-4 w-4"
                                        />
                                    </div>
                                    <span
                                        className={`flex-1 text-sm ${task.done ? "line-through text-zinc-400 dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-50"
                                            }`}
                                    >
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="text-sm text-zinc-600 hover:text-red-600 dark:text-zinc-300"
                                        aria-label={`Delete ${task.text}`}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <footer className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Tip: tasks are saved locally in your browser.
                    </div>
                    <div className="flex items-center gap-2">
                        {tasks.length > 0 && <button
                            onClick={() => clearAllTasks()}
                            className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:opacity-95"
                            aria-label="Remove all tasks"
                        >
                            Remove all
                        </button>}
                    </div>
                </footer>
            </main>
        </div>
    )
}
