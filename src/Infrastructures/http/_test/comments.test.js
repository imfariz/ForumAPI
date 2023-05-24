const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  let accessToken;

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
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
    const authResponse = JSON.parse(requestAuth.payload);

    accessToken = authResponse.data.accessToken;
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when post /threads/{threadId}/comments', () => {
    it('should add comment to thread with status code 201', async () => {
      const requestPayload = {
        content: 'Need Help',
      };

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should throw an Unauthorized error with status code 401', async () => {
      const requestPayload = {
        content: 'Need Help!!',
      };
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-448/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw not found error when thread not exist', async () => {
      const requestPayload = {
        content: 'Need Help!!',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ada');
    });

    it('should throw data type error with bad payload', async () => {
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal menambahkan komentar. Bentuk content tidak sesuai');
    });
    it('should throw property error with empty payload', async () => {
      const requestPayload = {};

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });

      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal menambahkan komentar. Properti yang di butuhkan kurang lengkap');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should delete comment with status code 200', async () => {
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });

      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments/comment-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw error when have not auth yet', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-448/comments/comment-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw not found error when thread not exist', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ada');
    });

    it('should throw not found error when comment not exist', async () => {
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ owner: 'fariz' });

      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments/comment-123',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ada');
    });

    it('should throw author error when deleting comments now owns', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'penghapus',
          password: 'secret',
          fullname: 'Penghapus Comment',
        },
      });

      await ThreadsTableTestHelper.addThread({ owner: 'penghapus' });
      await CommentsTableTestHelper.addComment({ owner: 'penghapus' });

      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-448/comments/comment-448',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar Gagal dihapus. Bukan komentar anda');
    });
  });
});
