import { pool } from './../index.js';

export async function insertStats(stat) {

  const query = `
    INSERT INTO polling_station_stats (
      total_votes,
      votes,
      valid_votes,
      invalid_votes,
      polling_station_id,
      election_id,
      document_path
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [
    stat.total_votes,
    stat.votes,
    stat.valid_votes,
    stat.invalid_votes,
    stat.polling_station_id,
    stat.election_id,
    stat.document_path
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error inserting stats:', error);
  }

}