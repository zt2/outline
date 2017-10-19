// @flow
import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Flex from 'components/Flex';
import { type Revision } from 'models/Document';

type RevisionListProps = {
  revisions: Revision[],
  onClick: () => void,
};

const RevisionList = observer((props: RevisionListProps) => {
  return (
    <List column>
      {props.revisions.map(revision => (
        <RevisionItem
          key={revision.id}
          revision={revision}
          onClick={props.onClick}
        />
      ))}
    </List>
  );
});

const List = styled(Flex)`
  padding: 0 20px;
`;

type RevisionProps = {
  revision: Revision,
  onClick: () => void,
};

const RevisionItem = observer((props: RevisionProps) => {
  const handleOnClick = () => props.onClick(props.revision.id);
  return <div onClick={handleOnClick}>{props.revision.user.name}</div>;
});

export default RevisionList;
