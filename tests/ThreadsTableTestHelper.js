/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-448',
    title = 'Monster Hunter Rise',
    body = 'Cara Farming Material',
    owner = 'vijoe',
    createdAt = '2023-05-16 12:45:40',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, createdAt],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
