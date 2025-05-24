import { pool } from './../index.js';

export async function insertStats(stat) {

  const query = `
    INSERT INTO polling_station_stats (
      total_votes,
      votes,
      valid_votes,
      invalid_votes,
      polling_station_id,
      election_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `;

  const values = [
    stat.total_votes,
    stat.votes,
    stat.valid_votes,
    stat.invalid_votes,
    stat.polling_station_id,
    stat.election_id
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error inserting stats:', error);
  }

}