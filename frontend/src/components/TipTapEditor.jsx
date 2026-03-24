import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Code,
    Highlighter,
    Underline as UnderlineIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    CheckSquare,
    Type,
    Heading1,
    Heading2,
    Palette,
    Youtube as YoutubeIcon,
    Video
} from 'lucide-react';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Enter Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('Enter YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            });
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const colors = [
        { name: 'Default', color: '#37352f' },
        { name: 'Red', color: '#e03e3e' },
        { name: 'Blue', color: '#0b6e99' },
        { name: 'Green', color: '#0f7b6c' },
        { name: 'Orange', color: '#d9730d' },
        { name: 'Purple', color: '#6940a5' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 mb-4 sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('paragraph') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Text"
                >
                    <Type className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Underline"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Highlight"
                >
                    <Highlighter className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
                <div className="relative group p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded cursor-pointer">
                    <Palette className="w-4 h-4" />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-xl p-2 hidden group-hover:grid grid-cols-3 gap-1 min-w-[120px] transition-all">
                        {colors.map(c => (
                            <button
                                key={c.name}
                                onClick={() => editor.chain().focus().setColor(c.color).run()}
                                className="w-8 h-8 rounded-lg border border-gray-100 hover:scale-110 transition-transform flex items-center justify-center font-bold text-[10px]"
                                style={{ color: c.color, backgroundColor: c.color + '10' }}
                            >
                                A
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={setLink}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Add Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={addImage}
                    className="p-1.5 rounded transition-colors hover:bg-gray-50 text-gray-400"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={addYoutubeVideo}
                    className="p-1.5 rounded transition-colors hover:bg-red-50 text-gray-400 hover:text-red-500"
                    title="Add YouTube Video"
                >
                    <YoutubeIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('taskList') ? 'bg-gray-100 text-black' : 'hover:bg-gray-50 text-gray-400'}`}
                    title="Task List"
                >
                    <CheckSquare className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-1.5 rounded transition-colors hover:bg-gray-50 text-gray-400"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-1.5 rounded transition-colors hover:bg-gray-50 text-gray-400"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const TipTapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            Typography,
            Highlight.configure({ multicolor: true }),
            Link.configure({ openOnClick: false }),
            Image.configure({ inline: true, allowBase64: true }),
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({
                placeholder: '输入内容或输入 / 唤起菜单...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full h-full flex flex-col prose prose-notion max-w-none">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1 px-4 cursor-text min-h-[500px]" />
        </div>
    );
};

export default TipTapEditor;
