const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentToThread(data) {
    const { threadId, content, owner } = data;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4) RETURNING id, comment, owner',
      values: [id, threadId, owner, content],
    };

    const result = await this._pool.query(query);

    return new AddedComment({
      id: result.rows[0].id,
      content: result.rows[0].comment,
      owner: result.rows[0].owner,
    });
  }

  async verifyCommentAccess(data) {
    const { commentId, owner } = data;

    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1 AND is_delete = false',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ada');
    }

    const { owner: commentOwner } = result.rows[0];

    if (owner !== commentOwner) {
      throw new AuthorizationError('Komentar Gagal dihapus. Bukan komentar anda');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT id, owner AS username, comment AS content, created_at AS date, is_delete 
          FROM comments WHERE thread_id = $1 ORDER BY created_at`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ada');
    }

    return result.rows.map((comment) => ({
      ...comment,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
