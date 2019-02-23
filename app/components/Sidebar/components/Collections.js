// @flow
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Tree, { TreeNode } from 'rc-tree';
import {
  PlusIcon,
  CollapsedIcon,
  CollectionIcon,
  PrivateCollectionIcon,
} from 'outline-icons';

import { collectionUrl, documentUrl } from 'utils/routeHelpers';
import Header from './Header';
import SidebarLink from './SidebarLink';
import CollectionLink from './CollectionLink';
import Fade from 'components/Fade';
import Flex from 'shared/components/Flex';

import CollectionsStore from 'stores/CollectionsStore';
import UiStore from 'stores/UiStore';
import DocumentsStore from 'stores/DocumentsStore';

type Props = {
  collections: CollectionsStore,
  documents: DocumentsStore,
  onCreateCollection: () => void,
  history: Object,
  ui: UiStore,
};

@observer
class Collections extends React.Component<Props> {
  isPreloaded: boolean = !!this.props.collections.orderedData.length;
  @observable autoExpandParent: boolean = true;
  @observable expandedKeys: string[] = [];

  componentDidMount() {
    this.props.collections.fetchPage({ limit: 100 });
  }

  onExpand = expandedKeys => {
    console.log('onExpand');
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  };

  onDragEnter = ({ expandedKeys }) => {
    console.log('onDragEnter');
    this.expandedKeys = expandedKeys;
  };

  onSelect = (selectedKeys, { node }) => {
    const isCollection = node.props.pos.split('-').length === 2;

    if (isCollection) {
      const id = node.props.eventKey;
      this.expandedKeys = [id];
      this.props.history.push(collectionUrl(id));
    } else {
      const id = node.props.eventKey;
      const url = node.props.url;
      this.expandedKeys = this.expandedKeys.concat(id);
      this.props.history.push(url);
    }
  };

  render() {
    const { collections, ui, documents } = this.props;

    const loop = data => {
      return data.map(doc => {
        if (doc.children && doc.children.length) {
          return (
            <TreeItem
              key={doc.id}
              title={<Label>{doc.title}</Label>}
              url={doc.url}
              switcherIcon={props => <Disclosure expanded={props.expanded} />}
            >
              {loop(doc.children)}
            </TreeItem>
          );
        }
        return (
          <TreeItem
            key={doc.id}
            title={<Label>{doc.title}</Label>}
            url={doc.url}
            isLeaf
          />
        );
      });
    };

    const content = (
      <Flex column>
        <Header>Collections</Header>
        <StyledTree
          expandedKeys={this.expandedKeys}
          onExpand={this.onExpand}
          onDragEnter={this.onDragEnter}
          onSelect={this.onSelect}
          autoExpandParent={this.autoExpandParent}
          draggable
        >
          {collections.orderedData.map(collection => (
            <TreeItem
              key={collection.id}
              title={collection.name}
              switcherIcon={props => (
                <IconWrapper>
                  {collection.private ? (
                    <PrivateCollectionIcon
                      expanded={props.expanded}
                      color={collection.color}
                    />
                  ) : (
                    <CollectionIcon
                      expanded={props.expanded}
                      color={collection.color}
                    />
                  )}
                </IconWrapper>
              )}
            >
              {loop(collection.documents)}
            </TreeItem>
          ))}
        </StyledTree>
      </Flex>
    );

    return (
      collections.isLoaded &&
      (this.isPreloaded ? content : <Fade>{content}</Fade>)
    );

    // const { collections, ui, documents } = this.props;
    // const content = (
    //   <Flex column>
    //     <Header>Collections</Header>
    //     {collections.orderedData.map(collection => (
    //       <CollectionLink
    //         key={collection.id}
    //         collection={collection}
    //         activeDocument={documents.active}
    //         prefetchDocument={documents.prefetchDocument}
    //         ui={ui}
    //       />
    //     ))}
    //     <SidebarLink
    //       onClick={this.props.onCreateCollection}
    //       icon={<PlusIcon />}
    //       label="New collection…"
    //     />
    //   </Flex>
    // );
  }
}

const StyledTree = styled(Tree)`
  list-style: none;
  margin: 0;
  padding: 0;

  ul {
    margin: 0;
    padding: 0;
  }
`;

const Label = styled.div`
  position: relative;
  width: 100%;
  max-height: 4.4em;
`;

const TreeItem = styled(TreeNode)`
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 16px;
  border-radius: 4px;
  color: ${props => props.theme.slateDark};
  font-weight: ${props => (props.selected ? '600' : '400')};
  background: ${props => (props.selected ? 'rgba(0, 0, 0, 0.05)' : 'inherit')};
  font-size: 15px;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.text};
  }
`;

const IconWrapper = styled.span`
  margin-left: -4px;
  margin-right: 4px;
  height: 24px;
`;

const Disclosure = styled(CollapsedIcon)`
  position: absolute;
  left: 0;

  ${({ expanded }) => !expanded && 'transform: rotate(-90deg);'};
`;

export default inject('collections', 'ui', 'documents')(
  withRouter(Collections)
);
