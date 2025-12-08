import React, { useState, useEffect } from 'react';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Modal } from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../api'; 
interface BlogItem {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  images?: string[];
  tags?: string[];
}

interface BlogForm {
  title: string;
  author: string;
  date: string;
  content: string;
  images: string[] | string;
  tags: string[] | string;
}

// Input is a JS forwardRef component without TS props. Use a local typed alias to avoid
// prop-type errors while preserving runtime behavior.
const InputAny = (Input as unknown) as React.ForwardRefExoticComponent<any>;


// Toolbar Button Component that auto-updates active state
const ToolbarButton: React.FC<{
  editor: any;
  onClick: () => void;
  isActive: (editor: any) => boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ editor, onClick, isActive, children, className = '' }) => {
  const [active, setActive] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      setActive(isActive(editor));
    };

    update(); // Initial update
    
    // Update on transaction (any editor change)
    const handleUpdate = () => {
      update();
      setUpdateKey(prev => prev + 1);
    };

    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      editor.off('update', handleUpdate);
    };
  }, [editor, isActive, updateKey]);

  // Also check on render
  const currentActive = editor ? isActive(editor) : false;

  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        // Force immediate update
        requestAnimationFrame(() => {
          setActive(isActive(editor));
          setUpdateKey(prev => prev + 1);
        });
      }}
      className={`px-3 py-1 rounded text-sm transition-colors ${
        (active || currentActive) ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </button>
  );
};


const BlogManagement = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentBlog, setCurrentBlog] = useState<BlogItem | null>(null);
  const [form, setForm] = useState<BlogForm>({
    title: '',
    author: '',
    date: '',
    content: '',
    images: [],
    tags: []
  });

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState<{ role?: string; [key: string]: any } | null>(null);
  
  // State to force re-render when editor state changes
  const [editorUpdateKey, setEditorUpdateKey] = useState(0);

  // State for URL input modal
  const [showUrlModal, setShowUrlModal] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlType, setUrlType] = useState<'image' | 'link'>('image');

  // State for font size
  const [selectedFontSize, setSelectedFontSize] = useState<string>('');

  // Tiptap Editor for admin
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: null,
              parseHTML: (element: any) => {
                const fontSize = element.style?.fontSize;
                return fontSize || null;
              },
              renderHTML: (attributes: any) => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
          };
        },
      }),
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm({ ...form, content: editor.getHTML() });
      setEditorUpdateKey(prev => prev + 1); // Force re-render
    },
    onSelectionUpdate: () => {
      setEditorUpdateKey(prev => prev + 1); // Force re-render on selection change
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none',
      },
    },
  });

  // Apply font size when typing if selectedFontSize is set
  useEffect(() => {
    if (editor && selectedFontSize) {
      // Set mark for next typed text
      editor.chain().focus().setMark('textStyle', { fontSize: selectedFontSize + 'px' }).run();
    }
  }, [selectedFontSize, editor]);

  // Update editor content when form.content changes (for editing)
  useEffect(() => {
    if (editor && form.content && editor.getHTML() !== form.content) {
      editor.commands.setContent(form.content);
    }
  }, [isModalOpen, currentBlog]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        console.log('Current user loaded:', user); // Debug log
      } catch (error) {
        console.error('Error parsing currentUser:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, []);

   const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs'); // Thay fetch bằng api.get
      setBlogs(response.data as BlogItem[]);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement & HTMLTextAreaElement;
    const { name, value } = target;
    setForm({ ...form, [name]: value } as unknown as BlogForm);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, images: value.split(',').map((img: string) => img.trim()) } as BlogForm);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, tags: value.split(',').map((tag: string) => tag.trim()) } as BlogForm);
  };

  const handleAddBlog = () => {
    setCurrentBlog(null);
    setForm({
      title: '',
      author: '',
      date: new Date().toISOString().slice(0, 10), // Default to current date
      content: '',
      images: [],
      tags: []
    });
    if (editor) {
      editor.commands.setContent('');
    }
    setIsModalOpen(true);
  };

  const handleEditBlog = (blog: BlogItem) => {
    setCurrentBlog(blog);
    setForm({
      title: blog.title,
      author: blog.author,
      date: blog.date,
      content: blog.content,
      images: blog.images ? blog.images.join(',') : '',
      tags: blog.tags ? blog.tags.join(',') : ''
    });
    if (editor) {
      editor.commands.setContent(blog.content);
    }
    setIsModalOpen(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await fetch(`http://localhost:3001/blogs/${id}`, {
        method: 'DELETE',
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleUrlSubmit = () => {
    if (!editor) {
      alert('Editor chưa sẵn sàng. Vui lòng thử lại.');
      setShowUrlModal(false);
      return;
    }

    const url = urlInput.trim();
    if (!url) {
      alert('Vui lòng nhập URL.');
      return;
    }

    try {
      if (urlType === 'image') {
        // Validate image URL format
        if (!url.match(/^https?:\/\/.+/i) && !url.match(/^data:image\//i)) {
          alert('URL không hợp lệ. Vui lòng nhập URL đầy đủ (bắt đầu bằng http:// hoặc https://)');
          return;
        }
        // Try setImage first, if fails use insertContent
        try {
          editor.chain().focus().setImage({ src: url }).run();
          console.log('Image inserted with setImage:', url);
        } catch (setImageError) {
          // Fallback: use insertContent
          editor.chain().focus().insertContent(`<img src="${url}" alt="Image" />`).run();
          console.log('Image inserted with insertContent:', url);
        }
      } else {
        // Link
        if (!url.match(/^https?:\/\/.+/i)) {
          alert('URL không hợp lệ. Vui lòng nhập URL đầy đủ (bắt đầu bằng http:// hoặc https://)');
          return;
        }
        // Nếu có text được chọn, thêm link vào text đó
        if (editor.state.selection.empty) {
          // Nếu không có text được chọn, chèn link như text
          editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${url}</a>`).run();
        } else {
          // Nếu có text được chọn, thêm link vào text đó
          editor.chain().focus().setLink({ href: url }).run();
        }
        console.log('Link inserted:', url);
      }
      setShowUrlModal(false);
      setUrlInput('');
    } catch (error) {
      console.error(`Error inserting ${urlType}:`, error);
      alert(`Có lỗi xảy ra khi chèn ${urlType === 'image' ? 'hình ảnh' : 'liên kết'}. Vui lòng thử lại.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const blogData = {
      ...form,
      images: Array.isArray(form.images)
        ? form.images
        : (typeof form.images === 'string' ? form.images.split(',').map((img: string) => img.trim()) : []),
      tags: Array.isArray(form.tags)
        ? form.tags
        : (typeof form.tags === 'string' ? form.tags.split(',').map((tag: string) => tag.trim()) : []),
    };

     try {
      if (currentBlog) {
        await api.put(`/blogs/${currentBlog!.id}`, blogData);  // Sử dụng api.put thay vì fetch
      } else {
        await api.post('/blogs', { ...blogData, id: Date.now().toString() });  // Sử dụng api.post thay vì fetch
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Blog</h2>
        <Button onClick={handleAddBlog} className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2">
          <PlusCircle className="w-5 h-5" />
          <span>Thêm bài viết mới</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Tiêu đề</th>
              <th className="py-3 px-6 text-left">Tác giả</th>
              <th className="py-3 px-6 text-left">Ngày đăng</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{blog.title}</td>
                <td className="py-3 px-6 text-left">{blog.author}</td>
                <td className="py-3 px-6 text-left">{blog.date}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-4">
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label={`Chỉnh sửa bài viết ${blog.title}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Xóa bài viết ${blog.title}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <div className="flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentBlog ? 'Chỉnh sửa bài viết Blog' : 'Thêm bài viết Blog mới'}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
            <InputAny
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">Tác giả</label>
            <InputAny
              type="text"
              id="author"
              name="author"
              value={form.author}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Ngày đăng</label>
            <InputAny
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
            {/* Rich Text Editor for admin when creating or editing blog */}
            {currentUser?.role === 'admin' && editor && editor.isEditable ? (
              <div className="mt-1 border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                {/* Toolbar */}
                <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50">
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={(ed) => ed.isActive('bold')}
                    className="font-semibold"
                  >
                    <strong>B</strong>
                  </ToolbarButton>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={(ed) => ed.isActive('italic')}
                    className="italic"
                  >
                    <em>I</em>
                  </ToolbarButton>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={(ed) => ed.isActive('underline')}
                  >
                    <u>U</u>
                  </ToolbarButton>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={(ed) => ed.isActive('heading', { level: 1 })}
                  >
                    H1
                  </ToolbarButton>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={(ed) => ed.isActive('heading', { level: 2 })}
                  >
                    H2
                  </ToolbarButton>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={(ed) => ed.isActive('heading', { level: 3 })}
                  >
                    H3
                  </ToolbarButton>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={(ed) => ed.isActive('bulletList')}
                  >
                    •
                  </ToolbarButton>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={(ed) => ed.isActive('orderedList')}
                  >
                    1.
                  </ToolbarButton>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!editor) {
                        alert('Editor chưa sẵn sàng. Vui lòng thử lại.');
                        return;
                      }
                      setUrlType('image');
                      setUrlInput('');
                      setShowUrlModal(true);
                    }}
                    className="px-3 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Chèn hình ảnh"
                  >
                    🖼️
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!editor) {
                        alert('Editor chưa sẵn sàng. Vui lòng thử lại.');
                        return;
                      }
                      setUrlType('link');
                      setUrlInput('');
                      setShowUrlModal(true);
                    }}
                    className="px-3 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Chèn liên kết"
                  >
                    🔗
                  </button>
                  <ToolbarButton
                    editor={editor}
                    onClick={() => {
                      if (editor) {
                        editor.chain().focus().toggleBlockquote().run();
                      }
                    }}
                    isActive={(ed) => ed ? ed.isActive('blockquote') : false}
                    title="Trích dẫn"
                  >
                    "
                  </ToolbarButton>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  {/* Font Family */}
                  <select
                    onChange={(e) => {
                      if (editor) {
                        const font = e.target.value;
                        if (font === 'default') {
                          editor.chain().focus().unsetFontFamily().run();
                        } else {
                          editor.chain().focus().setFontFamily(font).run();
                        }
                      }
                    }}
                    className="px-2 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                    title="Phông chữ"
                  >
                    <option value="default">Phông chữ</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                  </select>
                  {/* Font Size */}
                  <select
                    value={selectedFontSize || 'default'}
                    onChange={(e) => {
                      if (!editor) return;
                      const size = e.target.value;
                      
                      if (size === 'default') {
                        setSelectedFontSize('');
                        editor.chain().focus().unsetMark('textStyle').run();
                      } else {
                        setSelectedFontSize(size);
                        // Set mark so next typed text will have this font size
                        editor.chain().focus().setMark('textStyle', { fontSize: size + 'px' }).run();
                      }
                    }}
                    className="px-2 py-1 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
                    title="Kích thước chữ"
                  >
                    <option value="default">Kích thước</option>
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                    <option value="28">28px</option>
                    <option value="32">32px</option>
                    <option value="36">36px</option>
                  </select>
                  {/* Text Color */}
                  <input
                    type="color"
                    onChange={(e) => {
                      if (editor) {
                        editor.chain().focus().setColor(e.target.value).run();
                      }
                    }}
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    title="Màu chữ"
                    defaultValue="#000000"
                  />
                </div>
                {/* Editor Content */}
                <div className="min-h-[300px] p-4">
                  <EditorContent editor={editor} />
                </div>
                <style>{`
                  .tiptap-editor {
                    outline: none;
                    min-height: 300px;
                  }
                  .tiptap-editor .ProseMirror {
                    outline: none;
                    min-height: 300px;
                  }
                  .tiptap-editor .ProseMirror p {
                    margin: 0.75em 0;
                    line-height: 1.6;
                  }
                  .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                  }
                  .tiptap-editor .ProseMirror h1 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    line-height: 1.2;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    color: #111827;
                  }
                  .tiptap-editor .ProseMirror h2 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    line-height: 1.3;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    color: #111827;
                  }
                  .tiptap-editor .ProseMirror h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    line-height: 1.4;
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                    color: #111827;
                  }
                  .tiptap-editor .ProseMirror ul,
                  .tiptap-editor .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                  }
                  .tiptap-editor .ProseMirror ul {
                    list-style-type: disc;
                  }
                  .tiptap-editor .ProseMirror ol {
                    list-style-type: decimal;
                  }
                  .tiptap-editor .ProseMirror li {
                    margin: 0.5rem 0;
                    line-height: 1.6;
                  }
                  .tiptap-editor .ProseMirror li p {
                    margin: 0;
                  }
                  .tiptap-editor .ProseMirror blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #4b5563;
                  }
                  .tiptap-editor .ProseMirror blockquote p {
                    margin: 0.5rem 0;
                  }
                  .tiptap-editor .ProseMirror strong {
                    font-weight: 700;
                  }
                  .tiptap-editor .ProseMirror em {
                    font-style: italic;
  }
                  .tiptap-editor .ProseMirror u {
                    text-decoration: underline;
                  }
                  .tiptap-editor .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    margin: 1.5rem 0;
                    border-radius: 0.5rem;
                  }
                  .tiptap-editor .ProseMirror a {
                    color: #2563eb;
                    text-decoration: underline;
                    cursor: pointer;
                  }
                  .tiptap-editor .ProseMirror a:hover {
                    color: #1d4ed8;
                  }
                `}</style>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleInputChange}
                required
                rows={15}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nhập nội dung bài viết..."
              ></textarea>
            )}
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Thẻ (cách nhau bằng dấu phẩy)</label>
            <InputAny
              type="text"
              id="tags"
              name="tags"
              value={Array.isArray(form.tags) ? form.tags.join(',') : (form.tags as string)}
              onChange={handleTagChange}
              className="mt-1 block w-full"
            />
          </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Lưu
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {urlType === 'image' ? 'Nhập URL hình ảnh' : 'Nhập URL liên kết'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {urlType === 'image' 
                ? 'Ví dụ: https://example.com/image.jpg' 
                : 'Ví dụ: https://example.com'}
            </p>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                } else if (e.key === 'Escape') {
                  setShowUrlModal(false);
                  setUrlInput('');
                }
              }}
              placeholder={urlType === 'image' ? 'https://example.com/image.jpg' : 'https://example.com'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => {
                  setShowUrlModal(false);
                  setUrlInput('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleUrlSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Chèn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
