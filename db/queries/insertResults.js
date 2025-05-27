import { pool } from './../index.js';

export async function insertResults(results) {
  if (!results.length) return;

  const columns = ['election_id', 'polling_station_id', 'candidate_id', 'votes', 'percentage'];
  const values = [];
  results.forEach(({ election_id, polling_station_id, candidate_id, votes, percentage }) => {
    values.push(election_id, polling_station_id, candidate_id, votes, percentage);
  });
  const placeholders = results
    .map((_, i) => {
      const base = i * 5;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    })
    .join(', ');
  const query = `
    INSERT INTO station_results (election_id, polling_station_id, candidate_id, votes, percentage)
    VALUES ${placeholders};
  `;

  await pool.query(query, values);
}