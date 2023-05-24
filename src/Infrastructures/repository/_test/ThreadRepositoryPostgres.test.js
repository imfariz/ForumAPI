const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      const addThread = new AddThread({
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
        owner: 'vijoe',
      });

      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(addThread);

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return thread property correctly', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      const addThread = new AddThread({
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
        owner: 'vijoe',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Monster Hunter Rise',
        owner: 'vijoe',
      }));
    });
  });

  describe('isThreadExist function', () => {
    it('should throw not found error when thread id not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      await expect(threadRepositoryPostgres.isThreadExist('thread-4567')).rejects.toThrowError(NotFoundError);
    });

    it('should pass when thread is founded', async () => {
      await UsersTableTestHelper.addUser({ username: 'vijoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-448', owner: 'vijoe' });
      const fakeIdGenerator = () => '448';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.isThreadExist('thread-448')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw not found error when thread id not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      await expect(threadRepositoryPostgres.getThreadById('thread-12343')).rejects.toThrowError(NotFoundError);
    });

    it('should return property correcly', async () => {
      const expectedThread = {
        id: 'thread-13',
        title: 'Monster Hunter Rise',
        body: 'Cara Farming Material',
        date: new Date('2023-05-16 12:45:40'),
        username: 'vijoe13',
      };
      await UsersTableTestHelper.addUser({ username: 'vijoe13' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-13', owner: 'vijoe13' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      const threadDetails = await threadRepositoryPostgres.getThreadById('thread-13');

      expect(threadDetails).toStrictEqual(expectedThread);
      expect(threadDetails).toHaveProperty('id', 'thread-13');
      expect(threadDetails).toHaveProperty('title', 'Monster Hunter Rise');
      expect(threadDetails).toHaveProperty('body', 'Cara Farming Material');
      expect(threadDetails).toHaveProperty('username', 'vijoe13');
      expect(threadDetails).toHaveProperty('date', new Date('2023-05-16 12:45:40'));
    });
  });
});
