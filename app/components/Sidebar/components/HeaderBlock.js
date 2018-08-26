// @flow
import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { ExpandedIcon } from 'outline-icons';
import Flex from 'shared/components/Flex';
import TeamLogo from './TeamLogo';

type Props = {
  teamName: string,
  subheading: string,
  showDisclosure?: boolean,
  collapsed?: boolean,
  logoUrl: string,
  theme: Object,
};

function HeaderBlock({
  showDisclosure,
  teamName,
  subheading,
  collapsed,
  logoUrl,
  theme,
  ...rest
}: Props) {
  return (
    <Header justify="flex-start" align="center" collapsed={collapsed} {...rest}>
      <TeamLogo alt={`${teamName} logo`} src={logoUrl} />
      {!collapsed && (
        <Meta align="flex-start" column>
          <TeamName showDisclosure>
            {teamName}{' '}
            {showDisclosure && <StyledExpandedIcon color={theme.text} />}
          </TeamName>
          <Subheading>{subheading}</Subheading>
        </Meta>
      )}
    </Header>
  );
}

const Meta = styled(Flex)`
  height: 38px;
`;

const StyledExpandedIcon = styled(ExpandedIcon)`
  position: absolute;
  right: 0;
  top: -2px;
`;

const Subheading = styled.div`
  padding-left: 10px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
  color: ${props => props.theme.slateDark};
`;

const TeamName = styled.div`
  position: relative;
  padding-left: 10px;
  padding-right: 24px;
  font-weight: 600;
  color: ${props => props.theme.text};
  line-height: 1.3;
  text-decoration: none;
  font-size: 16px;
`;

const Header = styled(Flex)`
  flex-shrink: 0;
  padding: ${props => (props.collapsed ? '16px 17px' : '16px 24px')};
  position: relative;
  cursor: pointer;
  width: 100%;

  &:active,
  &:hover {
    transition: background 100ms ease-in-out;
    background: rgba(0, 0, 0, 0.05);
  }
`;

export default withTheme(HeaderBlock);
