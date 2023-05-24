const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailsThreadUseCase = require('../GetDetailsThreadUseCase');
const DetailsComment = require('../../../Domains/comments/entities/DetailsComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('GetDetailsThread', () => {
  it('should throw error when payload did not contain property needed', async () => {
    const threadId = '';
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({});

    await expect(getDetailsThreadUseCase.execute(threadId))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const threadId = 448;
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({});

    await expect(getDetailsThreadUseCase.execute(threadId))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-448';
    const expectedDetailsThreads = {
      id: 'thread-448',
      title: 'Monster Hunter Rise',
      body: 'Cara Farming Material',
      date: new Date('2023-05-12 19:00:00.000000'),
      username: 'vijoe',
      comments: [
        new DetailsComment(
          {
            id: 'comment-448',
            username: 'vijoe',
            date: new Date('2023-05-15 20:05:12.312967'),
            content: 'Helppp',
            is_delete: false,
          },
        ),
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-448',
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
        date: new Date('2023-05-12 19:00:00.000000'),
        username: 'vijoe',
      }));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-448',
          username: 'vijoe',
          date: new Date('2023-05-15 20:05:12.312967'),
          content: 'Helppp',
          is_delete: false,
        },
      ]));

    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const thread = await getDetailsThreadUseCase.execute(threadId);

    expect(thread).toStrictEqual(expectedDetailsThreads);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId)
      .toHaveBeenCalledWith(threadId);
  });
});
