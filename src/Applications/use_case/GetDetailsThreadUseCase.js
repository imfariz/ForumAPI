const DetailsComment = require('../../Domains/comments/entities/DetailsComment');

class GetDetailsThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    this._validatePayload(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentData = await this._commentRepository.getCommentByThreadId(threadId);

    // const comment = new DetailsComment(commentData);
    const comment = commentData.map((data) => new DetailsComment({
      id: data.id,
      username: data.username,
      date: data.date,
      content: data.content,
      is_delete: data.is_delete,
    }));

    return {
      ...thread,
      // commentData,
      comments: comment,
    };
  }

  _validatePayload(threadId) {
    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetDetailsThreadUseCase;
