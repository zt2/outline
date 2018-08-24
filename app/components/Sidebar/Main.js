// @flow
import * as React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { HomeIcon, BackIcon, EditIcon, SearchIcon, StarredIcon } from 'outline-icons';

import Flex from 'shared/components/Flex';
import AccountMenu from 'menus/AccountMenu';
import Sidebar, { Section } from './Sidebar';
import Scrollable from 'components/Scrollable';
import Collections from './components/Collections';
import SidebarLink from './components/SidebarLink';
import HeaderBlock from './components/HeaderBlock';
import Bubble from './components/Bubble';

import AuthStore from 'stores/AuthStore';
import DocumentsStore from 'stores/DocumentsStore';
import UiStore from 'stores/UiStore';

type Props = {
  history: Object,
  location: Location,
  auth: AuthStore,
  documents: DocumentsStore,
  ui: UiStore,
};

@observer
class MainSidebar extends React.Component<Props> {
  componentDidMount() {
    this.props.documents.fetchDrafts();
  }

  handleCreateCollection = () => {
    this.props.ui.setActiveModal('collection-new');
  };

  handleToggleSidebar = () => {
    this.props.ui.toggleCollapsedSidebar();
  }

  render() {
    const { auth, documents, ui } = this.props;
    const { user, team } = auth;
    if (!user || !team) return;

    return (
      <Sidebar collapsed={ui.sidebarCollapsed}>
        <AccountMenu
          label={
            <HeaderBlock
              subheading={user.name}
              teamName={team.name}
              logoUrl={team.avatarUrl}
              collapsed={ui.sidebarCollapsed}
              showDisclosure
            />
          }
        />
        <Flex auto column>
          <Scrollable shadow>
            <Section>
              <SidebarLink to="/dashboard" icon={<HomeIcon />} exact={false}>
                Home
              </SidebarLink>
              <SidebarLink to="/search" icon={<SearchIcon />}>
                Search
              </SidebarLink>
              <SidebarLink to="/starred" icon={<StarredIcon />}>
                Starred
              </SidebarLink>
              <SidebarLink
                to="/drafts"
                icon={<EditIcon />}
                active={
                  documents.active ? !documents.active.publishedAt : undefined
                }
              >
                Drafts <Bubble count={documents.drafts.length} />
              </SidebarLink>
            </Section>
            <Section>
              <Collections
                history={this.props.history}
                location={this.props.location}
                onCreateCollection={this.handleCreateCollection}
              />
            </Section>
            <Toggle onClick={this.handleToggleSidebar} collapsed={ui.sidebarCollapsed}><BackIcon /></Toggle>
          </Scrollable>
        </Flex>
      </Sidebar>
    );
  }
}

const Toggle = styled.a`
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: ${props => props.theme.smoke};
  width: 100%;
  transform: opacity 100ms ease-in-out;

  svg {
    opacity: .5;
    transform: ${props => props.collapsed ? 'none' : 'rotate(-180deg)'};
  }

  &:hover {
    svg {
      opacity: 1;
    }
  }
`;

export default withRouter(
  inject('user', 'documents', 'auth', 'ui')(MainSidebar)
);
