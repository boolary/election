import pkg from 'pg';
const { Pool } = pkg;

import dbConfig from './config.js';

export const pool = new Pool(dbConfig)