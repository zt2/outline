// @flow
import React from 'react';
import { observer, inject } from 'mobx-react';
import { Redirect } from 'react-router';
import _ from 'lodash';

import CollectionsStore from 'stores/CollectionsStore';

import Layout from 'components/Layout';
import CenteredContent from 'components/CenteredContent';
import AtlasPreviewLoading from 'components/AtlasPreviewLoading';

type Props = {
  collections: CollectionsStore,
  match: Object,
};

@observer class Collection extends React.Component {
  props: Props;

  state = {
    redirectUrl: null,
  };

  componentDidMount = async () => {
    const { id } = this.props.match.params;
    const collection = await this.props.collections.getById(id);

    if (collection.type !== 'atlas')
      throw new Error('TODO code up non-atlas collections');

    this.setState({
      redirectUrl: collection.navigationTree.url,
    });
  };

  render() {
    return (
      <Layout>
        {this.state.redirectUrl && <Redirect to={this.state.redirectUrl} />}

        <CenteredContent>
          <AtlasPreviewLoading />
        </CenteredContent>
      </Layout>
    );
  }
}
export default inject('collections')(Collection);
