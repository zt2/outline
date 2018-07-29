/* eslint-disable flowtype/require-valid-file-annotation */
import TestServer from 'fetch-test-server';
import app from '..';
import { flushdb } from '../test/support';
import { buildUser, buildSubscription } from '../test/factories';

const server = new TestServer(app.callback());

beforeEach(flushdb);
afterAll(server.close);

describe('#subscription.info', async () => {
  it('should return free subscription', async () => {
    const user = await buildUser();
    const res = await server.post('/api/subscription.info', {
      body: { token: user.getJwtToken() },
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body.data.plan).toEqual('free');
  });

  it('should return monthly subscription', async () => {
    const user = await buildUser();
    await buildSubscription({
      teamId: user.teamId,
      userId: user.id,
    });
    const res = await server.post('/api/subscription.info', {
      body: { token: user.getJwtToken() },
    });
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body.data.plan).toEqual('subscription-monthly');
    expect(body.data.status).toEqual('active');
    expect(body.data.seats).toEqual(1);
  });

  it('should require authentication', async () => {
    await buildUser();
    const res = await server.post('/api/subscription.info');

    expect(res.status).toEqual(401);
  });
});
