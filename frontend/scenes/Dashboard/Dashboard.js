// @flow
import React from 'react';
import { observer, inject } from 'mobx-react';
import { Flex } from 'reflexbox';

import CollectionsStore from 'stores/CollectionsStore';

import Layout from 'components/Layout';
import AtlasPreview from 'components/AtlasPreview';
import AtlasPreviewLoading from 'components/AtlasPreviewLoading';
import CenteredContent from 'components/CenteredContent';

type Props = {
  collections: CollectionsStore,
};

@observer class Dashboard extends React.Component {
  props: Props;

  render() {
    const { collections } = this.props;

    return (
      <Flex auto>
        <Layout>
          <CenteredContent>
            <Flex column auto>
              {!collections.isLoaded
                ? <AtlasPreviewLoading />
                : collections.data.map(collection => {
                    return (
                      <AtlasPreview key={collection.id} data={collection} />
                    );
                  })}
            </Flex>
          </CenteredContent>
        </Layout>
      </Flex>
    );
  }
}

export default inject('user', 'collections')(Dashboard);
