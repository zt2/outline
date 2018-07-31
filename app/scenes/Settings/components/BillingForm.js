// @flow
import * as React from 'react';
import { Elements, CardElement, injectStripe } from 'react-stripe-elements';
import styled, { withTheme } from 'styled-components';
import invariant from 'invariant';
import Button from 'components/Button';
import { LabelText } from 'components/Input';

type Props = {
  children: React.Node,
  submitNote: React.Node,
  submitLabel: React.Node,
  onSuccess: (token: string) => *,
  theme: Object,
  stripe?: {
    createToken: () => *,
  },
};

@injectStripe
class BillingForm extends React.Component<Props> {
  handleSubmit = async (ev: SyntheticEvent<>) => {
    ev.preventDefault();
    invariant(this.props.stripe, 'Stripe must exist');

    try {
      const res = await this.props.stripe.createToken();
      invariant(res, 'res is available');
      const { token, error } = res;

      if (token) {
        this.props.onSuccess(token.id);
      } else {
        alert(error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { theme, children, submitLabel, submitNote } = this.props;
    const style = {
      base: {
        color: theme.text,
        fontSize: theme.fontSize,
        '::placeholder': {
          color: theme.placeholder,
        },
      },
    };

    return (
      <form onSubmit={this.handleSubmit}>
        {children}
        <LabelText>Payment details</LabelText>
        <StyledCardElement style={style} />
        {submitNote}
        <Button type="submit">{submitLabel}</Button>
      </form>
    );
  }
}

const Wrapper = (props: Props) => {
  return (
    <Elements>
      <BillingForm {...props} />
    </Elements>
  );
};

const StyledCardElement = styled(CardElement)`
  padding: 8px 12px;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => props.theme.slateLight};
  border-radius: 4px;
  margin: 0 0 16px;
`;

export default withTheme(Wrapper);
