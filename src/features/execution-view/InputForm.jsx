import React from 'react';
import { useForm } from 'react-hook-form';
import { Play } from 'lucide-react';

const InputForm = ({ schema = {}, onRun }) => {
  const { register, handleSubmit } = useForm();

  // Custom submit handler to ensure numbers are actually sent as numbers
  const onSubmit = (data) => {
    const formattedData = { ...data };
    
    // Type casting based on schema
    Object.keys(schema).forEach((key) => {
      if (schema[key].type === 'number') {
        formattedData[key] = parseFloat(data[key]);
      }
      if (schema[key].type === 'boolean') {
        formattedData[key] = data[key] === 'true';
      }
    });

    onRun(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">Execution Data</h2>
      
      {Object.keys(schema).map((key) => (
        <div key={key} className="group">
          <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest group-focus-within:text-blue-500 transition-colors">
            {key} {schema[key].required && <span className="text-red-500">*</span>}
          </label>
          <input
            {...register(key, { required: schema[key].required })}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            type={schema[key].type === 'number' ? 'number' : 'text'}
            placeholder={`Enter ${key}...`}
          />
        </div>
      ))}

      {/* Fallback for Testing */}
      {Object.keys(schema).length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <p className="text-xs text-amber-700 font-medium mb-2 italic">
            ⚠️ No input schema defined in Workflow Editor.
          </p>
          <p className="text-[10px] text-amber-600">
            The engine will use the raw values typed here. Ensure they match your Rule conditions.
          </p>
        </div>
      )}

      <button 
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] mt-6"
      >
        <Play size={18} fill="currentColor" /> Run Execution
      </button>
    </form>
  );
};

export default InputForm;