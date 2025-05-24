import { pool } from './../index.js';

export async function insertRegions(regions) {
  if (!regions.length) return;

  const columns = ['name', 'external_id'];

  const values = [];
  regions.forEach(region => {
    columns.forEach(col => values.push(region[col] ?? null));
  });

  const valuePlaceholders = regions.map((_, i) => {
    const baseIndex = i * columns.length;
    const placeholders = columns.map((_, j) => `$${baseIndex + j + 1}`);
    return `(${placeholders.join(', ')})`;
  })
  .join(', ');

  const query = `
    INSERT INTO regions (${columns.join(', ')})
    VALUES ${valuePlaceholders}
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
  `;

  return (await pool.query(query, values)).rows;
}