// @flow
import React from 'react';
import { Editor } from 'slate-react';
import Toolbar from '../components/Toolbar';
import BlockInsert from '../components/BlockInsert';

export default function Toolbars({ insertImage }) {
  return {
    renderEditor(props: Object, editor: Editor) {
      if (props.readOnly) return props.children;

      return [
        <Toolbar value={editor.value} editor={editor} />,
        <BlockInsert
          editor={editor}
          onInsertImage={file =>
            editor.change(change => insertImage(change, file, editor))
          }
        />,
        props.children,
      ];
    },
  };
}
