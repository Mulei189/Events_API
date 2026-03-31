// Setup database connection using Neon and Drizzle ORM

import '/dotenv/config';
import { neon, neonConfig} from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL)
// Initialize Drizzle ORM with Neon client
const db = drizzle(sql)

export {db, sql};