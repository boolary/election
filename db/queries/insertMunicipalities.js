import { pool } from './../index.js';

export async function insertMunicipalities(municipalities) {
  if (!municipalities.length) return;

  const columns = ['name', 'external_id', 'region_id'];
  const values = [];
  municipalities.forEach(({ name, external_id, region_id }) => {
    values.push(name, external_id, region_id);
  });

  const placeholders = municipalities
    .map((_, i) => {
      const base = i * 3;
      return `($${base + 1}, $${base + 2}, $${base + 3})`;
    })
    .join(', ');

  const query = `
    INSERT INTO municipalities (name, external_id, region_id)
    VALUES ${placeholders}
    ON CONFLICT (name) DO NOTHING;
  `;

  await pool.query(query, values);
}