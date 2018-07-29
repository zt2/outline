/* eslint-disable flowtype/require-valid-file-annotation */
import TestServer from 'fetch-test-server';
import app from '..';
import { flushdb } from '../test/support';
import { buildUser } from '../test/factories';

const server = new TestServer(app.callback());

beforeEach(flushdb);
afterAll(server.close);

describe('#auth.info', async () => {
  it('should return auth info', async () => {
    const user = await buildUser();
    const res = await server.post('/api/auth.info', {
      body: { token: user.getJwtToken() },
    });
    expect(res.status).toEqual(200);
  });

  it('should require authentication', async () => {
    await buildUser();
    const res = await server.post('/api/auth.info');

    expect(res.status).toEqual(401);
  });
});
