import { NextApiRequest, NextApiResponse } from 'next';
import { deleteJobByJobId, getJobByJobId } from '../../../util/database';

export default async function singleJobHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let jobId = req.query.jobId;

  if (req.method === 'GET') {
    const job = await getJobByJobId(jobId);
    return res.status(200).json({ job: job || null });
  } else if (req.method === 'DELETE') {
    const job = await deleteJobByJobId(jobId);
    return res.status(200).json({ job: job || null });
  }

  res.status(400).json(null);
}
