const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when post /threads', () => {
    it('should be add threads with response 201', async () => {
      const requestPayload = {
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fariz',
          password: 'secret',
          fullname: 'Fariz Ramadhan',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'fariz',
          password: 'secret',
        },
      });
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should throw an Unauthorized error with status code 401', async () => {
      const requestPayload = {
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw need property error with bad payload', async () => {
      const requestPayload = {
        title: 'Monster Hunter Rise',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fariz',
          password: 'secret',
          fullname: 'Fariz Ramadhan',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'fariz',
          password: 'secret',
        },
      });
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread gagal dibuat. Informasi masih kurang lengkap');
    });

    it('should throw data type error with bad payload', async () => {
      const requestPayload = {
        title: 'Monster Hunter Rise',
        body: 123,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fariz',
          password: 'secret',
          fullname: 'Fariz Ramadhan',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'fariz',
          password: 'secret',
        },
      });
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread gagal dibuat. Bentuk informasi kurang sesuai');
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should get thread details with status code 200', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fariz',
          password: 'secret',
          fullname: 'Fariz Ramadhan',
        },
      });

      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-448');
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0].id).toEqual('comment-448');
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
    });

    it('should be show "**komentar telah dihapus**"  after deleted a comment', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fariz',
          password: 'secret',
          fullname: 'Fariz Ramadhan',
        },
      });

      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });
      await CommentsTableTestHelper.deleteComment('comment-448');

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });
  });
});
