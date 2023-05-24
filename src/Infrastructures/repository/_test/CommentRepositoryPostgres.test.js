const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment to thread', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await UsersTableTestHelper.addUser({ id: 'user-448', username: 'fariz' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-k3jt', owner: 'vijoe' });
      const addComment = new AddComment({
        threadId: 'thread-k3jt',
        content: 'HELPP!!!',
        owner: 'fariz',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedCommentToThread = await commentRepositoryPostgres
        .addCommentToThread(addComment);

      expect(addedCommentToThread).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        owner: addComment.owner,
      }));
    });
  });

  describe('verifyThreadCommentAccess function', () => {
    it('should throw not found error when comment is not exist', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-448', owner: 'vijoe' });
      const data = {
        threadId: 'thread-448',
        commentId: 'comment-x23',
        owner: 'vijoe',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess(data))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when deleting comment that were not created by that user', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await UsersTableTestHelper.addUser({ username: 'fariz', id: 'user-6st' });
      await ThreadsTableTestHelper.addThread({ owner: 'vijoe' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });
      const data = {
        threadId: 'thread-448',
        commentId: 'comment-448',
        owner: 'vijoe',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess(data))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw authorization error when deletes comment', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await UsersTableTestHelper.addUser({ username: 'fariz', id: 'user-6st' });
      await ThreadsTableTestHelper.addThread({ owner: 'vijoe' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });
      const data = {
        threadId: 'thread-448',
        commentId: 'comment-448',
        owner: 'fariz',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should update is_delete column in comment', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await UsersTableTestHelper.addUser({ username: 'fariz', id: 'user-6st' });
      await ThreadsTableTestHelper.addThread({ owner: 'vijoe' });
      await CommentsTableTestHelper.addComment({ owner: 'fariz' });
      const data = {
        threadId: 'thread-448',
        commentId: 'comment-448',
        owner: 'fariz',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
      await commentRepositoryPostgres.deleteComment(data.commentId);

      const checkComment = await CommentsTableTestHelper.getCommentById(data.commentId);
      expect(checkComment.is_delete).toEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should throw not found error when comment is not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.getCommentByThreadId('thread-12vt43')).rejects.toThrowError(NotFoundError);
    });

    it('should return property correcly', async () => {
      const expectedComment = [
        {
          id: 'comment-448',
          username: 'vijoe13',
          content: 'Makasih',
          date: new Date('2023-05-16 12:45:40'),
          is_delete: false,
        },
      ];
      UsersTableTestHelper.addUser({ username: 'vijoe13' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-448', owner: 'vijoe13' });
      await CommentsTableTestHelper.addComment({ owner: 'vijoe13' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentDetails = await commentRepositoryPostgres.getCommentByThreadId('thread-448');

      expect(commentDetails).toStrictEqual(expectedComment);
      expect(commentDetails[0]).toHaveProperty('id', 'comment-448');
      expect(commentDetails[0]).toHaveProperty('content', 'Makasih');
      expect(commentDetails[0]).toHaveProperty('username', 'vijoe13');
      expect(commentDetails[0]).toHaveProperty('date', new Date('2023-05-16 12:45:40'));
      expect(commentDetails[0]).toHaveProperty('is_delete', false);
    });
  });
});
