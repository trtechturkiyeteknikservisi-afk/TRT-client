'use client';

import React, { useEffect, useRef } from 'react';
import 'jodit/es2021/jodit.min.css';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

interface JoditEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  direction?: 'ltr' | 'rtl';
  language?: 'en' | 'tr' | 'ar';
  height?: number;
}

// Convert dataURL to Blob and upload directly to Cloudinary via backend API
async function uploadBase64Image(dataUrl: string, apiBase: string, token: string | null): Promise<string | null> {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split('/')[1] || 'png';
    const blob = new Blob([u8arr], { type: mime });
    const formData = new FormData();
    formData.append('image', blob, `pasted-image-${Date.now()}.${ext}`);

    const res = await fetch(`${apiBase}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch (err) {
    console.error('Failed to upload base64 image', err);
    return null;
  }
}

function cleanWordHtmlString(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!--\[if gte vml 1\]>[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
    .replace(/<img[^>]*src=["']file:\/\/[^"']*["'][^>]*>/gi, '')
    .replace(/<p[^>]*class=["']?MsoNormal["']?[^>]*>\s*<\/p>/gi, '');
}

export default function JoditEditor({ value, onChange, placeholder, direction = 'ltr', language = 'en', height = 350 }: JoditEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const joditRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
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

        const config = {
          readonly: false,
          placeholder: placeholder || 'Start writing...',
          height: height || 350,
          theme: theme === 'dark' ? 'dark' : 'default',
          language: language,
          direction: direction,
          toolbarAdaptive: false,
          askBeforePasteHTML: false,
          askBeforePasteFromWord: false,
          defaultActionOnPaste: (Jodit.constants ? Jodit.constants.INSERT_CLEAR_HTML : 'insert_clear_html') as any,
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
              get Authorization() {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                return token ? `Bearer ${token}` : '';
              }
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
              const imageUrl = data.url || (data.files && data.files[0]);
              if (imageUrl) {
                // @ts-ignore
                this.selection.insertImage(imageUrl);
                toast.success('تم رفع الصورة بنجاح');
              }
            },
            error: function (e: Error) {
              console.error("Paste/Upload error:", e);
              toast.error('فشل رفع الصورة. يرجى التأكد أن الحجم أقل من 5 ميجابايت.');
            }
          }
        };

        const instance = Jodit.make(editorRef.current, config);
        joditRef.current = instance;
        instance.value = value;
        
        // Debounced onChange to avoid heavy re-renders on every keystroke
        instance.events.on('change', (newValue: string) => {
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }
          debounceTimer.current = setTimeout(() => {
            if (active && newValue !== value) {
              onChange(newValue);
            }
          }, 250);
        });

        // Immediately commit latest value on blur
        instance.events.on('blur', () => {
          if (active && instance) {
            if (debounceTimer.current) {
              clearTimeout(debounceTimer.current);
            }
            onChange(instance.value);
          }
        });

        // Intercept paste to sanitize Word content and auto-upload Base64 images
        instance.events.on('beforePaste', (event: ClipboardEvent) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return;

          // 1. Direct image file paste (e.g., screenshots)
          if (clipboardData.files && clipboardData.files.length > 0) {
            const file = clipboardData.files[0];
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              const toastId = toast.loading('جاري رفع الصورة الملصقة...');
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              const formData = new FormData();
              formData.append('image', file);

              fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: formData
              })
                .then(res => res.json())
                .then(data => {
                  if (data.url) {
                    toast.success('تم رفع الصورة بنجاح', { id: toastId });
                    instance.selection.insertImage(data.url);
                  } else {
                    toast.error('فشل رفع الصورة', { id: toastId });
                  }
                })
                .catch(err => {
                  console.error(err);
                  toast.error('حدث خطأ أثناء رفع الصورة', { id: toastId });
                });

              return false;
            }
          }

          // 2. HTML paste (e.g., from Word or external web pages)
          const html = clipboardData.getData('text/html');
          if (html) {
            const base64Regex = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/gi;
            const matches = [...html.matchAll(base64Regex)];
            let cleanedHtml = cleanWordHtmlString(html);

            if (matches.length > 0) {
              event.preventDefault();
              const toastId = toast.loading('جاري معالجة ورفع الصور المرفقة...');
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

              (async () => {
                try {
                  for (const match of matches) {
                    const base64Src = match[1];
                    const uploadedUrl = await uploadBase64Image(base64Src, API_BASE, token);
                    if (uploadedUrl) {
                      cleanedHtml = cleanedHtml.replace(base64Src, uploadedUrl);
                    } else {
                      cleanedHtml = cleanedHtml.replace(match[0], '');
                    }
                  }
                  toast.success('تمت معالجة ورفع الصور بنجاح', { id: toastId });
                  instance.selection.insertHTML(cleanedHtml);
                } catch (err) {
                  console.error('Error uploading pasted images:', err);
                  toast.error('حدث خطأ أثناء معالجة الصور', { id: toastId });
                  const safeHtml = cleanedHtml.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi, '');
                  instance.selection.insertHTML(safeHtml);
                }
              })();

              return false;
            } else if (cleanedHtml !== html) {
              event.preventDefault();
              instance.selection.insertHTML(cleanedHtml);
              return false;
            }
          }
        });

      } catch (err) {
        console.error("Failed to initialize Jodit:", err);
      }
    };

    initJodit();

    return () => {
      active = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
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

  // Sync external value without jumping cursor if active element is inside the editor
  useEffect(() => {
    if (joditRef.current && joditRef.current.value !== value) {
      const isFocused = joditRef.current.editor && joditRef.current.editor.contains(document.activeElement);
      if (!isFocused) {
        joditRef.current.value = value;
      }
    }
  }, [value]);

  return <textarea ref={editorRef} />;
}
