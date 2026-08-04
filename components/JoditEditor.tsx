'use client';

import React, { useEffect, useRef } from 'react';
import 'jodit/es2021/jodit.min.css';
import { useTheme } from 'next-themes';

interface JoditEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  direction?: 'ltr' | 'rtl';
  language?: 'en' | 'tr' | 'ar';
}

export default function JoditEditor({ value, onChange, placeholder, direction = 'ltr', language = 'en' }: JoditEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const joditRef = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let active = true;

    const initJodit = async () => {
      try {
        const JoditModule = await import('jodit');
        const Jodit = JoditModule.Jodit || JoditModule.default;
        
        if (!active) return;
        if (!editorRef.current) return;

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const config = {
          readonly: false,
          placeholder: placeholder || 'Start writing...',
          height: 450,
          theme: theme === 'dark' ? 'dark' : 'default',
          language: language,
          direction: direction,
          toolbarAdaptive: false,
          askBeforePasteHTML: false,
          askBeforePasteFromWord: false,
          defaultActionOnPaste: (Jodit.constants ? Jodit.constants.INSERT_AS_HTML : 'insert_as_html') as any,
          cleanHTML: {
            fillEmptyParagraph: false,
            replaceOldTags: false as const,
            removeEmptyElements: false
          },
          buttons: [
            'source', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'superscript', 'subscript', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'video', 'table', 'link', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'fullsize', 'selectall', 'print', 'about'
          ],
          uploader: {
            insertImageAsBase64URI: false,
            url: `${API_BASE}/upload`,
            format: 'json',
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            },
            prepareData: function (formdata: any) {
              const file = formdata.get('files[0]');
              if (file) {
                formdata.append('image', file);
                formdata.delete('files[0]');
              }
              return formdata;
            },
            process: function (resp: any) {
              return {
                files: [resp.url]
              };
            },
            defaultHandlerSuccess: function (data: any) {
              const imageUrl = data.files[0];
              if (imageUrl) {
                // @ts-ignore
                this.selection.insertImage(imageUrl);
              }
            },
            error: function (e: Error) {
              console.error("Paste/Upload error:", e);
            }
          }
        };

        joditRef.current = Jodit.make(editorRef.current, config);
        joditRef.current.value = value;
        
        joditRef.current.events.on('change', (newValue: string) => {
          if (newValue !== value) {
            onChange(newValue);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Jodit:", err);
      }
    };

    initJodit();

    return () => {
      active = false;
      if (joditRef.current) {
        joditRef.current.destruct();
        joditRef.current = null;
      }
    };
  }, []);

  // Update theme dynamically when useTheme changes
  useEffect(() => {
    if (joditRef.current && joditRef.current.container) {
      const isDark = theme === 'dark';
      joditRef.current.container.classList.toggle('jodit_theme_dark', isDark);
      joditRef.current.container.classList.toggle('jodit_theme_default', !isDark);
    }
  }, [theme]);

  useEffect(() => {
    if (joditRef.current && joditRef.current.value !== value) {
      joditRef.current.value = value;
    }
  }, [value]);

  return <textarea ref={editorRef} />;
}
