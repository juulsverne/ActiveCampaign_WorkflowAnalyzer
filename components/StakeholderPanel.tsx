import React, { useState } from 'react';
import { Users, X, Plus } from 'lucide-react';

interface StakeholderPanelProps {
  stakeholders: string[];
  onAddStakeholder: (name: string) => void;
  onRemoveStakeholder: (index: number) => void;
}

export const StakeholderPanel: React.FC<StakeholderPanelProps> = ({ stakeholders, onAddStakeholder, onRemoveStakeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddStakeholder(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg p-6 border border-slate-700 h-full">
      <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-cyan-400" />
        Involved Stakeholders
      </h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g., John Doe (Manager)"
          className="flex-1 bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 text-slate-300 placeholder-slate-500 text-sm"
        />
        <button
          type="submit"
          className="bg-cyan-600 text-white rounded-md p-2 hover:bg-cyan-700 disabled:bg-slate-600 transition-colors flex items-center justify-center"
          aria-label="Add stakeholder"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>
      <div className="space-y-2">
        {stakeholders.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {stakeholders.map((name, index) => (
              <li
                key={index}
                className="flex items-center bg-slate-700 text-slate-200 text-sm font-medium pl-3 pr-1 py-1 rounded-full"
              >
                <span>{name}</span>
                <button
                  onClick={() => onRemoveStakeholder(index)}
                  className="ml-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">Add stakeholders to improve analysis accuracy.</p>
        )}
      </div>
    </div>
  );
};
