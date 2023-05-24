const DetailsComment = require('../DetailsComment');

describe('DetailsComment entitiy', () => {
  it('should throw error when payload did not contain property needed', () => {
    const payload = {
      id: 'comment-448',
      username: 'vijoe',
      date: new Date('2023-05-12 19:00:19.000000'),
    };

    expect(() => new DetailsComment(payload)).toThrowError('DETAILS_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'Comment-448',
      username: 212,
      date: '0301199809876',
      content: 'HELPPP',
      is_delete: 12455,
    };

    expect(() => new DetailsComment(payload)).toThrowError('DETAILS_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return DetailsComment object correctly when comment is deleted', () => {
    const payload = {
      id: 'comment-448',
      username: 'vijoe',
      date: new Date('2023-05-12 19:00:00.000000'),
      content: 'HELPPPP',
      is_delete: true,
    };

    const commentDetails = new DetailsComment(payload);

    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(payload.date.toISOString());
    expect(commentDetails.content).toEqual('**komentar telah dihapus**');
  });

  it('should return DetailsComment object correctly', () => {
    const payload = {
      id: 'comment-448',
      username: 'vijoe',
      date: new Date('2023-05-12 19:00:00.000000'),
      content: 'HELPPPP',
      is_delete: false,
    };

    const commentDetails = new DetailsComment(payload);

    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(payload.date.toISOString());
    expect(commentDetails.content).toEqual(payload.content);
  });
});
