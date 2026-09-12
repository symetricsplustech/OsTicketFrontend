import React, { createContext, useContext } from 'react';
import { classNames } from '@shared/lib/classNames';

const TabsContext = createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

export function Tabs({ value, defaultValue, onValueChange, children, className }: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const changeValue = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };
  return <TabsContext.Provider value={{ value: currentValue, onValueChange: changeValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={classNames('inline-flex items-center gap-1 border-b', className)} {...props} />;
}

export function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const tabs = useContext(TabsContext);
  return <button type="button" role="tab" aria-selected={tabs.value === value} className={classNames('px-3 py-2 text-sm', tabs.value === value ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500', className)} onClick={() => tabs.onValueChange?.(value)} {...props} />;
}

export function TabsContent({ value, className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const tabs = useContext(TabsContext);
  if (tabs.value !== value) return null;
  return <div role="tabpanel" className={className} {...props}>{children}</div>;
}
