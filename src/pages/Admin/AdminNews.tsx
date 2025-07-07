import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Label } from '@radix-ui/react-label';
import { type News } from '../../types/News';
import { format, toDate } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { Calendar, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { $getRoot, $createParagraphNode, $createTextNode, $insertNodes, $setSelection, $getSelection, $isTextNode, ElementNode, type NodeKey, type LexicalEditor } from 'lexical';
import DOMPurify from 'dompurify';
import { $isElementNode, $createRangeSelection, $setSelection as setLexicalSelection } from 'lexical';
import { $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Custom Toolbar Plugin with new features
const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const applyColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            node.setStyle(`color: ${color}`);
          }
        });
      }
    });
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.update(() => {
        const imgNode = $createImageNode(
          url,
          'User image',
          'max-width: 100%; height: auto;'
        );
        const paragraph = $createParagraphNode();
        paragraph.append(imgNode);
        $insertNodes([paragraph]);
        $setSelection(null);
      });
    }
  };

  const insertQuote = () => {
    editor.update(() => {
      const quoteNode = $createQuoteNode();
      const textNode = $createTextNode('Enter quote here');
      quoteNode.append(textNode);
      $insertNodes([quoteNode]);
      const selection = $createRangeSelection();
      selection.anchor.set(textNode.getKey(), 0, 'text');
      selection.focus.set(textNode.getKey(), textNode.getTextContentSize(), 'text');
      setLexicalSelection(selection);
    });
  };

  const insertCodeBlock = () => {
    editor.update(() => {
      const codeNode = $createCodeNode();
      const textNode = $createTextNode('Enter code or diagram here');
      codeNode.append(textNode);
      $insertNodes([codeNode]);
      const selection = $createRangeSelection();
      selection.anchor.set(textNode.getKey(), 0, 'text');
      selection.focus.set(textNode.getKey(), textNode.getTextContentSize(), 'text');
      setLexicalSelection(selection);
    });
  };

  return (
    <div className="flex space-x-2 p-2 bg-gray-200 rounded-t-md">
      <Button
        type="button"
        onClick={() => applyColor('red')}
        className="bg-red-500 hover:bg-red-600 text-white text-xs"
      >
        Red
      </Button>
      <Button
        type="button"
        onClick={() => applyColor('blue')}
        className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
      >
        Blue
      </Button>
      <Button
        type="button"
        onClick={() => applyColor('purple')}
        className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
      >
        Purple
      </Button>
      <Button
        type="button"
        onClick={() => applyColor('black')}
        className="bg-black hover:bg-gray-800 text-white text-xs"
      >
        Black
      </Button>
      <Button
        type="button"
        onClick={insertQuote}
        className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
      >
        Quote
      </Button>
      <Button
        type="button"
        onClick={insertImage}
        className="bg-green-500 hover:bg-green-600 text-white text-xs"
      >
        Image
      </Button>
      <Button
        type="button"
        onClick={insertCodeBlock}
        className="bg-gray-500 hover:bg-gray-600 text-white text-xs"
      >
        Code
      </Button>
    </div>
  );
};

// Custom node for images
class ImageNode extends ElementNode {
  __src: string;
  __alt: string;
  __style: string;

  constructor(src: string, alt: string, style: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__style = style;
  }

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__style, node.getKey());
  }

  createDOM(): HTMLElement {
    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = this.__alt;
    img.style.cssText = this.__style;
    return img;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement): boolean {
    if (prevNode.__src !== this.__src) dom.setAttribute('src', this.__src);
    if (prevNode.__alt !== this.__alt) dom.setAttribute('alt', this.__alt);
    if (prevNode.__style !== this.__style) dom.style.cssText = this.__style;
    return false;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'image',
      src: this.__src,
      alt: this.__alt,
      style: this.__style,
      version: 1,
    };
  }

  static importJSON(serializedNode: any): ImageNode {
    return $createImageNode(serializedNode.src, serializedNode.alt, serializedNode.style);
  }
}

function $createImageNode(src: string, alt: string, style: string): ImageNode {
  return new ImageNode(src, alt, style);
}


const theme = {
  paragraph: 'mb-2 text-sm sm:text-base text-gray-700',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    ul: 'list-disc pl-4 sm:pl-6',
    ol: 'list-decimal pl-4 sm:pl-6',
  },
  link: 'text-purple-600 underline',
  quote: 'border-l-4 border-purple-500 pl-4 italic text-gray-600',
  code: 'bg-gray-100 p-2 rounded-md font-mono text-sm',
};

function onError(error: Error) {
  console.error(error);
}

export default function AdminNews() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [form, setForm] = useState<News>({ id: '', title: '', slug: '', content: '', author: '', publishedDate: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editorRef = useRef<LexicalEditor | null>(null);

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/news`, {
        params: { page, size: 10 },
      });
      setNewsList(response.data as News[]);
      setTotalPages(Number((response.data as any)['totalPages'] || response.headers['x-total-pages']) || 1);
      setTotalItems(Number((response.data as any)['totalElements'] || response.headers['x-total-elements']) || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);

    const formData = new FormData();
    const newsPayload = { ...form, publishedDate: new Date().toISOString() };
    if (!form.id) {
      delete (newsPayload as any).id; // Ensure id is not sent for new posts
    }
    formData.append('news', JSON.stringify(newsPayload));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/news/${form.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/news`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchNews();
      setForm({ id: '', title: '', slug: '', content: '', author: '', publishedDate: '' });
      setImageFile(null);
      setPreviewUrl(null);
      setError(null);
      if (editorRef.current) {
        editorRef.current.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        });
      }
    } catch (err) {
      setError('Failed to save news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (news: News) => {
    console.log('Editing news content:', news.content); // Debug log
    setForm(news);
    setImageFile(null);
    setPreviewUrl(null);
    if (editorRef.current && news.content) {
      try {
        // Sanitize content
        const sanitizedContent = DOMPurify.sanitize(news.content, { USE_PROFILES: { html: true }, ADD_TAGS: ['img'], ADD_ATTR: ['src', 'alt', 'style'] });
        console.log('Sanitized content:', sanitizedContent); // Debug log

        editorRef.current.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(sanitizedContent, 'text/html');
          let nodes = $generateNodesFromDOM(editorRef.current!, dom);
          console.log('Parsed nodes:', nodes); // Debug log

          // Transform unsupported nodes
          nodes = nodes.map(node => {
            if (!['paragraph', 'text', 'list', 'listitem', 'link', 'heading', 'quote', 'code', 'image'].includes(node.getType())) {
              const paragraph = $createParagraphNode();
              if ($isTextNode(node)) {
                paragraph.append(node);
              } else if ($isElementNode(node)) {
                node.getChildren().forEach(child => paragraph.append(child));
              }
              return paragraph;
            }
            return node;
          }).filter(node => node !== null);

          const root = $getRoot();
          root.clear();
          if (nodes.length > 0) {
            $insertNodes(nodes);
            $setSelection(null);
            console.log('Nodes inserted successfully');
          } else {
            console.warn('No valid nodes generated, using fallback');
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(sanitizedContent.replace(/<[^>]+>/g, '') || '');
            paragraph.append(textNode);
            root.append(paragraph);
          }
        });
      } catch (err) {
        console.error('Failed to load content into editor:', err);
        editorRef.current.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNews();
      setError(null);
    } catch (err) {
      setError('Failed to delete news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (_editorState: any, editor: any) => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor);
      setForm({ ...form, content: html });
    });
  };

  const initialConfig = {
    namespace: 'NewsEditor',
    theme,
    onError,
    nodes: [ListNode, ListItemNode, LinkNode, HeadingNode, QuoteNode, CodeNode, ImageNode],
    editorState: null,
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-5xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">Manage News</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </Label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Content
              </Label>
              <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <RichTextPlugin
                  contentEditable={<ContentEditable className="min-h-[150px] p-2 border rounded-md bg-white text-sm sm:text-base" />}
                  placeholder={<div className="text-gray-400 p-2 absolute top-0">Enter content...</div>}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <OnChangePlugin onChange={onChange} />
              </LexicalComposer>
            </div>
            <div>
              <Label htmlFor="author" className="text-sm font-medium text-gray-700">
                Author
              </Label>
              <input
                id="author"
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                Image
              </Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
                className={`mt-1 block w-full text-sm ${imageFile ? 'text-gray-700' : 'text-purple-500'}`}
              />
              {(previewUrl || form.imageUrl) && (
                <img src={previewUrl || form.imageUrl} alt="Preview" className="mt-2 h-24 w-auto rounded-md" />
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              {form.id ? 'Update News' : 'Create News'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        {newsList.map((news) => (
          <Card key={news.id} className="shadow-sm">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
              <div className="flex items-center space-x-4">
                {news.imageUrl && (
                  <img src={news.imageUrl} alt={news.title} className="h-12 w-12 object-cover rounded-md" />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-600 line-clamp-2">{news.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {format(toDate(new Date(news.publishedDate)), 'PPP p', { locale: enIN })}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(news)}
                  disabled={loading}
                  className="text-purple-600 border-purple-600 text-xs sm:text-sm"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(news.id)}
                  disabled={loading}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalItems > 0 && (
        <div className="mt-6 flex justify-between items-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-purple-600 border-purple-600 text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
