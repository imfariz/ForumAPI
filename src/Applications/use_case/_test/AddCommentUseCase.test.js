const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment to thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-448',
      content: 'Help!!!',
      owner: 'vijoe',
    };

    const returnAddedComment = new AddedComment({
      id: 'comment-448',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.isThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addCommentToThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-448',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })));

    const getThreadUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedCommentToThread = await getThreadUseCase.execute(useCasePayload);

    expect(addedCommentToThread).toStrictEqual(returnAddedComment);
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addCommentToThread)
      .toBeCalledWith(new AddComment(useCasePayload));
  });
});
