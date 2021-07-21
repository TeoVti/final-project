import { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteJobByJobId,
  getAllJobs,
  getJobByJobId,
  getJobsByValidSessionUser,
  getValidSessionByToken,
} from '../../../util/database';

// export type SingleSeedResponseType =
//   | { title: User | null }
//   | { errors: ApplicationError[] };

export default async function singleJobHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const allJobs = await getAllJobs();
  //console.log('allJobs', allJobs);

  const validSession = await getValidSessionByToken(req.cookies.sessionToken);
  // console.log('req.cookies', req.cookies.sessionToken);
  // console.log('validSession', validSession);
  const isSessionValid = validSession ? true : false;
  // console.log('isSessionValid', isSessionValid);

  let allJobsByValidSessionUser;

  // Check if valid session is defined
  if (validSession) {
    // Retrieve jobs of valid session user
    allJobsByValidSessionUser = await getJobsByValidSessionUser(
      validSession.userId,
    );
  } else {
    // return res.status(404).json({ errors: [{ message: 'No valid session.' }] });
  }

  // If we've successfully retrieved the jobs, return them
  return res.status(200).json({
    allJobs: allJobs,
    isSessionValid: isSessionValid,
    allJobsByValidSessionUser: allJobsByValidSessionUser,
  });
}
