// @flow
import React from 'react';
import Icon from './Icon';
import type { Props } from './Icon';

export default function CommentIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M6,4 L18,4 C19.1045695,4 20,4.8954305 20,6 L20,16 C20,17.1045695 19.1045695,18 18,18 L12,18 L9.5357666,20.9204102 L7.00109863,18 L6,18 C4.8954305,18 4,17.1045695 4,16 L4,6 C4,4.8954305 4.8954305,4 6,4 Z M6,6 L6,16 L8.04516602,16 L9.48980713,18.0046387 L11.0085449,16 L18,16 L18,6 L6,6 Z M8,8 L16,8 L16,10 L8,10 L8,8 Z M8,12 L15,12 L15,14 L8,14 L8,12 Z" />
    </Icon>
  );
}
