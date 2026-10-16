// Daily housekeeping at 03:17 UTC (05:17 or 06:17 in Lebanon depending on daylight saving):
// removes requests older than the retention period, expired sessions, used tokens and old rate-limit rows.
import { getApp, cleanup } from '../../server/app.js';

export default async () => {
  const { db } = await getApp();
  const r = await cleanup(db);
  console.log('cleanup done', r);
};

export const config = { schedule: '17 3 * * *' };
