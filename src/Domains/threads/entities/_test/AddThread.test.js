const AddThread = require('../AddThread');

describe('a addThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'Monster Hunter Rise',
      body: 'Cara Farming Material',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      title: 'Monster Hunter Rise',
      body: 'Cara Farming Material',
      owner: 123,
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should add Thread entities correctly', () => {
    const payload = {
      title: 'Monster Hunter Rise',
      body: 'Cara Farming Material',
      owner: 'vijoe',
    };

    const addThread = new AddThread(payload);

    expect(addThread).toBeInstanceOf(AddThread);
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.owner).toEqual(payload.owner);
  });
});
