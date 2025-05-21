import { pool } from './../index.js';

export async function insertResults(results) {
  if (!results.length) return;

  const columns = ['election_id', 'polling_station_id', 'candidate_id', 'votes', 'percentage', 'document_path'];
  const values = [];
  results.forEach(({ election_id, polling_station_id, candidate_id, votes, percentage, document_path }) => {
    values.push(election_id, polling_station_id, candidate_id, votes, percentage, document_path);
  });
  const placeholders = results
    .map((_, i) => {
      const base = i * 6;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    })
    .join(', ');
  const query = `
    INSERT INTO station_results (election_id, polling_station_id, candidate_id, votes, percentage, document_path)
    VALUES ${placeholders};
  `;

  await pool.query(query, values);
}