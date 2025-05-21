import { pool } from './../index.js';

export async function insertStations(stations) {
  if (!stations.length) return;
  
  const columns = ['name', 'external_id', 'municipality_id'];
  const values = [];
  stations.forEach(({ name, external_id, municipality_id }) => {
    values.push(name, external_id, municipality_id);
  });
  const placeholders = stations
    .map((_, i) => {
      const base = i * 3;
      return `($${base + 1}, $${base + 2}, $${base + 3})`;
    })
    .join(', ');
  const query = `
    INSERT INTO polling_stations (name, external_id, municipality_id)
    VALUES ${placeholders}
    ON CONFLICT (external_id) DO NOTHING;
  `;
  // console.log(query)
  await pool.query(query, values);
  return stations.length;
}