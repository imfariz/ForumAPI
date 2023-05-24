const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentToThreadUseCase = this._container.getInstance(AddCommentUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      content: request.payload.content,
      owner: request.auth.credentials.username,
    };

    const addedComment = await addCommentToThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.username,
    };

    await deleteCommentUseCase.execute(payload);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
