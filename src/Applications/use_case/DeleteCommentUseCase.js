class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.isThreadExist(useCasePayload.threadId);
    await this._commentRepository.verifyCommentAccess(useCasePayload);
    await this._commentRepository.deleteComment(useCasePayload.commentId);
  }

  _validatePayload(payload) {
    const { threadId, commentId, owner } = payload;
    if (!threadId || !commentId || !owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = DeleteCommentUseCase;
