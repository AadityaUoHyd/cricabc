import { useCallback } from 'react';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createListNode, $createListItemNode } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import { $insertNodes } from 'lexical';
import { Button } from '../components/ui/button';
import { Bold, Italic, Underline, Link, List, ListOrdered } from 'lucide-react';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (command: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
  };

  const insertList = (type: 'bullet' | 'number') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const list = $createListNode(type);
        const item = $createListItemNode();
        item.append(...selection.getNodes());
        list.append(item);
        $insertNodes([list]);
      }
    });
  };

  const insertLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const url = prompt('Enter URL');
        if (url) {
          const linkNode = $createLinkNode(url);
          linkNode.append(...selection.getNodes());
          $insertNodes([linkNode]);
        }
      }
    });
  }, [editor]);

  return (
    <div className="flex space-x-1 p-2 bg-gray-50 border-b rounded-t-md">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('bold')}
        className="text-gray-700 hover:bg-purple-100"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('italic')}
        className="text-gray-700 hover:bg-purple-100"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('underline')}
        className="text-gray-700 hover:bg-purple-100"
      >
        <Underline className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertLink}
        className="text-gray-700 hover:bg-purple-100"
      >
        <Link className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList('bullet')}
        className="text-gray-700 hover:bg-purple-100"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList('number')}
        className="text-gray-700 hover:bg-purple-100"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
    </div>
  );
}