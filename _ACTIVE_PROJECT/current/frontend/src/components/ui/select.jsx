import React, { createContext, useContext, useState } from 'react';

const SelectContext = createContext(null);

export function Select({ value, defaultValue, onValueChange, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const currentValue = value !== undefined ? value : internalValue;

  const setValue = (next) => {
    if (value === undefined) setInternalValue(next);
    if (onValueChange) onValueChange(next);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: currentValue, setValue, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children, ...props }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      className={`w-full border rounded px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      onClick={() => ctx?.setOpen(!ctx.open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder = '', className = '' }) {
  const ctx = useContext(SelectContext);
  return <span className={className}>{ctx?.value ?? placeholder}</span>;
}

export function SelectContent({ className = '', children }) {
  const ctx = useContext(SelectContext);
  if (!ctx?.open) return null;
  return (
    <div className={`absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ value, className = '', children, ...props }) {
  const ctx = useContext(SelectContext);
  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${ctx?.value === value ? 'bg-gray-50 font-medium' : ''} ${className}`}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </div>
  );
}

export function NativeSelect({ className = '', children, ...props }) {
  return <select className={`border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 ${className}`} {...props}>{children}</select>;
}

export default Select;
