// @flow
import React, { Component } from 'react';
import invariant from 'invariant';
import { observable, action, runInAction } from 'mobx';
import { observer, inject } from 'mobx-react';
import Modal from 'components/Modal';
import Flex from 'components/Flex';
import RevisionList from './components/RevisionList';
import Document, { type Revision } from 'models/Document';
import ErrorsStore from 'stores/ErrorsStore';
import { client } from 'utils/ApiClient';

type Props = {
  document: Document,
  errors: ErrorsStore,
  onClose: () => void,
};

@observer class DocumentMove extends Component {
  props: Props;

  @observable selectedRevision: Revision;
  @observable revisions: Revision[] = observable.array([]);
  @observable revisionsOffset: number = 0;
  @observable revisionsLoaded: boolean = false;
  @observable revisionsFetching: boolean = false;

  componentDidMount() {
    this.fetchRevisions();
  }

  @action fetchRevisions = async () => {
    const { document } = this.props;
    this.revisionsFetching = true;
    try {
      const res = await client.post('/documents.revisions', {
        id: document.id,
      });
      invariant(res && res.data, 'Document API response should be available');
      const { data } = res;
      runInAction('fetchRevisions', () => {
        this.revisions.replace([...this.revisions, ...data]);
        this.revisionsLoaded = true;
      });
    } catch (e) {
      this.props.errors.add('Document failed loading');
    }
    this.revisionsFetching = false;
  };

  render() {
    return (
      <Modal
        isOpen
        onRequestClose={this.props.onClose}
        title="Move document"
        fullSize
      >
        {this.revisionsLoaded &&
          <Flex>
            <RevisionList revisions={this.revisions} />
          </Flex>}
      </Modal>
    );
  }
}

export default inject('errors')(DocumentMove);
