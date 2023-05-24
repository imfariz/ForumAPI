const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const comment = new AddComment(useCasePayload);
    await this._threadRepository.isThreadExist(useCasePayload.threadId);
    return this._commentRepository.addCommentToThread(comment);
  }
}

module.exports = AddCommentUseCase;
