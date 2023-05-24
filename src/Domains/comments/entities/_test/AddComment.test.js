const AddComment = require('../AddComment');

describe('AddComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      threadId: 'thread-987',
      content: 'Help!!',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      threadId: 1234,
      content: 7854,
      owner: 'vijoe',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should add Comment to Thread entities correctly', () => {
    const payload = {
      threadId: 'thread-123',
      content: 'Helppp!!',
      owner: 'vijoe',
    };

    const addComment = new AddComment(payload);

    expect(addComment).toBeInstanceOf(AddComment);
    expect(addComment.threadId).toEqual(payload.threadId);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.owner).toEqual(payload.owner);
  });
});
