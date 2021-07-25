import { NextApiRequest, NextApiResponse } from 'next';
import {
  createJob,
  getSlugsByUserId,
  getUserById,
  getValidSessionByToken,
} from '../../../util/database';
import { generateSlug } from '../../../util/generateSlug';
import { generateTitle } from '../../../util/generateTitle';
import { ApplicationError, User } from '../../../util/types';

export type CreateJobResponse =
  | {
      job: any;
      user?: User;
      sluggedTitle: string;
    }
  | { errors: ApplicationError[] };

export default async function createJobHandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateJobResponse>,
) {
  if (req.method === 'POST') {
    const validSession = await getValidSessionByToken(req.cookies.sessionToken);
    // console.log('validSession', validSession);

    // Retrieve title, etc. from the request body from the frontend
    const { title, expId, regionId, day, pay, details } = req.body;

    // Declare variables for form validation
    const responseErrorObject: ApplicationError[] = [];
    let responseStatusCode: number = 200;

    // Create slug from title
    let sluggedTitle = '';
    let slug = '';

    if (validSession && title) {
      sluggedTitle = generateTitle(title);
      slug = generateSlug(validSession.userId, title);
    }

    // Check if slug is unique
    const userSlugs = await getSlugsByUserId(validSession.userId);

    const isSlugAlreadyUsed = userSlugs?.some(
      (slugObject: any) => slugObject.slug === slug,
    );

    // Save the job information to the database
    const job = await createJob(
      title,
      validSession.userId,
      expId,
      regionId,
      day,
      pay,
      details,
      slug,
    );

    console.log('successfully saved info in database');

    const user = await getUserById(job.userId);
    // console.log('user from create.ts', user);

    // Send response to frontend
    if (responseErrorObject.length > 0) {
      // If there is/are errors, return status code and errors to the frontend
      console.log('responseErrorObject.length', responseErrorObject.length);
      console.log('responseErrorObject bottom', responseErrorObject);
      return res
        .status(responseStatusCode)
        .json({ errors: [responseErrorObject] });
    } else {
      // Return job and user response to the frontend
      return res.status(200).json({
        job: job,
        user: user,
        sluggedTitle: sluggedTitle,
        errors: [],
      });
    }
  }
}
