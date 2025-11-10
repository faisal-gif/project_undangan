import React from 'react';

export default function SearchForm({ value, onChange, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="flex items-center mb-4">
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="border rounded-l-md px-4 py-2 w-full"
                placeholder="Cari Pendaftar..."
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
            >
                Cari
            </button>
        </form>
    );
}