// @flow
import * as React from 'react';
import { withTheme } from 'styled-components';
import { Elements } from 'react-stripe-elements';
import CardInputForm from './CardInputForm';

type Props = {
  onSuccess: string => Promise<*>,
  theme: Object,
};

class StripeForm extends React.Component<Props> {
  render() {
    return (
      <Elements>
        <CardInputForm
          onSuccess={this.props.onSuccess}
          theme={this.props.theme}
        />
      </Elements>
    );
  }
}

export default withTheme(StripeForm);
