// @flow
import uuid from 'uuid';
import { Change } from 'slate';

export default function KeyboardShortcuts() {
  return {
    onKeyDown(ev: SyntheticKeyboardEvent, change: Change) {
      if (!ev.metaKey) return null;

      switch (ev.key) {
        case 'b':
          return change.toggleMark('bold');
        case 'i':
          return change.toggleMark('italic');
        case 'u':
          return change.toggleMark('underlined');
        case 'd':
          return change.toggleMark('deleted');
        case 'k':
          return change.wrapInline({ type: 'link', data: { href: '' } });
        case 'µ': // µ = CMD+M
          ev.preventDefault();
          return change.call(this.createCommentThread);
        default:
          return null;
      }
    },

    createCommentThread(change: Change) {
      // TODO: allow toggling off
      const data = { threadId: uuid.v4() };
      change.toggleMark({ type: 'comment', data });
    },
  };
}
