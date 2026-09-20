import React, { useRef, useState, useEffect } from "react";
import { Button } from "./button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial value only if editor is empty
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !isFocused) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('bold')} className="font-bold h-8 px-2" title="Grassetto">B</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('italic')} className="italic h-8 px-2" title="Corsivo">I</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('underline')} className="underline h-8 px-2" title="Sottolineato">U</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('strikeThrough')} className="line-through h-8 px-2" title="Barrato">S</Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        <select 
          onChange={(e) => exec('fontSize', e.target.value)} 
          className="h-8 px-2 border border-slate-300 rounded text-sm bg-white cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue=""
          title="Dimensione Testo"
        >
          <option value="" disabled>Dimensione</option>
          <option value="1">Molto piccolo (10px)</option>
          <option value="2">Piccolo (13px)</option>
          <option value="3">Normale (16px)</option>
          <option value="4">Medio (18px)</option>
          <option value="5">Grande (24px)</option>
          <option value="6">Molto grande (32px)</option>
        </select>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <Button type="button" variant="ghost" size="sm" onClick={() => exec('justifyLeft')} className="h-8 px-2" title="Allinea a Sinistra">L</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('justifyCenter')} className="h-8 px-2" title="Allinea al Centro">C</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('justifyRight')} className="h-8 px-2" title="Allinea a Destra">R</Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('removeFormat')} className="h-8 px-2 text-red-600" title="Rimuovi formattazione">Pulisci</Button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto focus:outline-none max-w-none"
        contentEditable
        onInput={handleChange}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}
