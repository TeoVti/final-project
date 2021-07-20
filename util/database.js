import camelcaseKeys from 'camelcase-keys';
import dotenvSafe from 'dotenv-safe';
import postgres from 'postgres';

dotenvSafe.config();

// setPostgresDefaultsOnHeroku();

// Read the PostgreSQL secret connection information
// (host, database, username, password) from the .env file

// Connect only once to the database
// https://github.com/vercel/next.js/issues/7811#issuecomment-715259370
function connectOneTimeToDatabase() {
  let sql;

  if (process.env.NODE_ENV === 'production') {
    // Heroku needs SSL connections but
    // has an "unauthorized" certificate
    // https://devcenter.heroku.com/changelog-items/852
    sql = postgres({ ssl: { rejectUnauthorized: false } });
  } else {
    if (!globalThis.__postgresSqlClient) {
      globalThis.__postgresSqlClient = postgres();
    }
    sql = globalThis.__postgresSqlClient;
  }

  return sql;
}
// Connect to PostgreSQL
const sql = connectOneTimeToDatabase();

// Perform a first query
export async function getUsers() {
  const users = await sql`SELECT
  id,
  username,
  email
   FROM users`;
  return users.map((user) => camelcaseKeys(user));
}
console.log(getUsers());

// Secure version of getUsers which
// allows ANY authenticated user
// to view ALL users
export async function getUsersIfValidSessionToken(token) {
  // Security: Return "Access denied" error if falsy token passed
  if (!token) {
    const errors = [{ message: 'Access denied' }];
    return errors;
  }

  const session = await getValidSessionByToken(token);

  // Security: Return "Access denied" token does not
  // match valid session
  if (!session) {
    const errors = [{ message: 'Access denied' }];
    return errors;
  }

  // Security: Now this query has been protected
  // and it will only run in case the user has a
  // token corresponding to a valid session
  const users = await sql`
    SELECT
    id,
      username,
      email
    FROM
      users
  `;

  return users.map((user) => camelcaseKeys(user));
}

export async function getUserById(id) {
  // Return undefined if userId is not parseable
  // to an integer
  if (!id) return undefined;

  const users = await sql`
    SELECT
      id,
      username,
      email
    FROM
      users
    WHERE
      id = ${id}
  `;
  return users.map((user) => camelcaseKeys(user))[0];
}

export async function getUserByUsernameAndToken(username, token) {
  // Security: If the user is not logged in, we do not allow
  // access and return an error from the database function
  if (!token) {
    const errors = [{ message: 'Access denied' }];
    return errors;
  }

  // Return undefined if username is falsy
  // (for example, an undefined or '' value for the username)
  if (!username) return undefined;

  // Security: Retrieve user via the session token
  const userFromSession = await getUserByValidSessionToken(token);

  // If there is either:
  // - no valid session matching the token
  // - no user matching the valid session
  // ...return undefined
  if (!userFromSession) return undefined;

  // Retrieve all matching users from database
  const users = await sql`
    SELECT
      id,
      username,
      email
    FROM
      users
    WHERE
      username = ${username}
  `;

  // If we have no user, then return undefined
  const user = users[0];
  if (!user) return undefined;

  // Security: Match ids of session user with user
  // corresponding to requested username
  if (user.id !== userFromSession.id) {
    const errors = [{ message: 'Access denied' }];
    return errors;
  }

  return camelcaseKeys(user);
}

export async function getUserWithPasswordHashByUsername(username) {
  // Return undefined if username is falsy
  if (!username) return undefined;

  const users = await sql`
    SELECT
      *
    FROM
      users
    WHERE
      username = ${username}
  `;
  return users.map((user) => camelcaseKeys(user))[0];
}

//vgbhbnmkjhgfdfgbhnjmkmjhgfgthzjukgggggggggggggg

export async function insertUser(username, email, passwordHash) {
  const users = await sql`
    INSERT INTO users
      (username, email, password_hash)
    VALUES
      (${username}, ${email}, ${passwordHash})
    RETURNING
      id,
      username,
      email
  `;

  return users.map((user) => camelcaseKeys(user))[0];
}

export async function deleteExpiredSessions() {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      expiry < NOW()
    RETURNING *
  `;
  return sessions.map((session) => camelcaseKeys(session));
}

export async function deleteSessionByToken(token) {
  const sessions = await sql`
    DELETE FROM
      sessions
    WHERE
      token = ${token}
    RETURNING *
  `;
  return sessions.map((session) => camelcaseKeys(session))[0];
}
export async function insertSession(token, userId) {
  const sessions = await sql`
    INSERT INTO sessions
      (token, user_id)
    VALUES
      (${token}, ${userId})
    RETURNING *
  `;
  return sessions.map((session) => camelcaseKeys(session))[0];
}

export async function getValidSessionByToken(token) {
  if (!token) return undefined;

  const sessions = await sql`
    SELECT
      *
    FROM
      sessions
    WHERE
      token = ${token} AND
      expiry > NOW()
  `;
  return sessions.map((session) => camelcaseKeys(session))[0];
}
export async function getUserByValidSessionToken(token) {
  if (!token) return undefined;

  const session = await getValidSessionByToken(token);

  if (!session) return undefined;

  return await getUserById(session.userId);
}

export async function insertFiveMinuteSessionWithoutUserId(token) {
  const sessions = await sql`
    INSERT INTO sessions
      (token, expiry)
    VALUES
      (${token}, NOW() + INTERVAL '5 minutes')
    RETURNING *
  `;
  return sessions.map((session) => camelcaseKeys(session))[0];
}

export async function createJob(
  title,
  userId,
  expId,
  regionId,
  pay,
  details,
  slug,
) {
  const jobs = await sql`
    INSERT INTO jobs
      (title, user_id, exp_id, region_id, pay, details, slug)
    VALUES
      (${title}, ${userId}, ${expId}, ${regionId}, ${pay}, ${details}, ${slug})
    RETURNING
    title, user_id, exp_id, region_id, pay, details, slug
  `;
  return jobs.map((job) => camelcaseKeys(job))[0];
}

export async function getExperience() {
  const experience = await sql`
  SELECT
      id,
      title
    FROM
      experience
  `;
  return experience.map((exp) => camelcaseKeys(exp));
}

export async function getRegions() {
  const regions = await sql`
  SELECT
      id,
      title
    FROM
      regions
  `;
  return regions.map((region) => camelcaseKeys(region));
}

export async function getExpById(expId) {
  if (!expId) return undefined;

  const experience = await sql`
  SELECT
    id,
    title
  FROM
    experience
  WHERE
    id = ${expId}
  `;
  return experience.map((exp) => camelcaseKeys(exp))[0];
}

export async function getRegionById(regionId) {
  if (!regionId) return undefined;

  const regions = await sql`
  SELECT
    id,
    title
  FROM
    regions
  WHERE
    id = ${regionId}
  `;
  return regions.map((region) => camelcaseKeys(region))[0];
}

export async function getSlugsByUserId(userId) {
  if (!userId) return undefined;

  const slugs = await sql`
    SELECT
      slug
    FROM
      jobs
    WHERE
      user_id = ${userId}
  `;
  return slugs.map((slug) => camelcaseKeys(slug));
}

export async function getAllJobs() {
  const allJobs = await sql`
    SELECT
      jobs.id,
      jobs.title,
      jobs.user_id,
      jobs.exp_id,
      jobs.region_id,
      jobs.slug,
      jobs.pay,
      jobs.details,
      users.username,
      experience.title as experience_title,
      regions.title as regions_title
    FROM
      jobs,
      experience,
      users,
      regions
    WHERE
    jobs.region_id = regions.id
    AND
      jobs.user_id = users.id
    AND
      jobs.exp_id = experience.id
    ORDER by
      jobs.id DESC
    `;
  return allJobs.map((s) => camelcaseKeys(s));
}

export async function getJobsByValidSessionUser(validSessionUserId) {
  if (!validSessionUserId) return undefined;

  const allJobsByValidSessionUser = await sql`
    SELECT
      jobs.id,
      jobs.title,
      jobs.user_id,
      jobs.exp_id,
      jobs.region_id,
      jobs.slug,
      jobs.pay,
      jobs.details,
      users.username,
      experience.title as experience_title,
      regions.title as regions_title
    FROM
      jobs,
      experience,
      users,
      regions
      WHERE
      jobs.region_id = regions.id
    AND
      jobs.user_id = users.id
    AND
      jobs.exp_id = experience.id
    AND
      jobs.user_id = ${validSessionUserId}
    ORDER by
      jobs.id DESC
    `;
  return allJobsByValidSessionUser.map((s) => camelcaseKeys(s));
}

export async function deleteJobByJobId(jobId) {
  if (!jobId) return undefined;

  const jobs = await sql`
    DELETE FROM
      jobs
    WHERE
      id = ${jobId}
    RETURNING
      id
  `;
  return jobs.map((job) => camelcaseKeys(job))[0];
}

export async function getJobByJobId(jobId) {
  if (!jobId) return undefined;

  const jobs = await sql`
    SELECT
      jobs.id,
      jobs.title,
      exp_id,
      region_id,
      slug,
      pay,
      details,
      experience.title as experience_title,
      regions.title as regions_title
    FROM
      jobs,
      experience,
      regions
    WHERE
      jobs.id = ${jobId}
      AND
      exp_id = experience.id
      AND
      region_id = regions.id
  `;
  return jobs.map((job) => camelcaseKeys(job))[0];
}
