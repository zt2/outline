// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import styled from 'styled-components';
import Flex from 'shared/components/Flex';
import { layout, color } from 'shared/styles/constants';

@observer
class Header extends Component {
  @observable sticky: boolean = false;
  props: Props;

  componentDidMount() {
    window.addEventListener('scroll', this.updateVisibility);
    this.updateVisibility();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateVisibility);
  }

  updateVisibility = () => {
    this.sticky = window.scrollY > 130;
  };

  render() {
    return (
      <StyledHeader sticky={this.sticky}>
        <h1>{this.props.title}</h1>
        <Actions>{this.props.children}</Actions>
      </StyledHeader>
    );
  }
}

export const Action = styled(Flex)`
  justify-content: center;
  align-items: center;
  padding: 0 0 0 10px;

  a {
    color: ${color.text};
    height: 24px;
  }
`;

export const Separator = styled.div`
  margin-left: 12px;
  width: 1px;
  height: 20px;
  background: ${color.slateLight};
`;

const StyledHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: ${layout.vpadding} ${layout.hpadding};
  transition: all 250ms ease-in-out;
  border-bottom: ${props =>
    props.sticky ? `1px solid ${color.smokeDark}` : '1px solid transparent'};
  background: ${props =>
    props.sticky ? `rgba(255, 255, 255, 0.9)` : 'transparent'};
  -webkit-backdrop-filter: blur(20px);

  @media print {
    display: none;
  }

  h1 {
    margin: 0;
    font-size: 18px;
    text-align: center;
    transition: opacity 250ms ease-in-out;
    opacity: ${props => (props.sticky ? 100 : 0)};
  }
`;

const Actions = styled(Flex)`
  position: absolute;
  right: 1.75vw;
  top: 1.5vw;
`;

export default Header;
