import { getJobByJobId } from '../../util/database';

export default function SingleJob(props: any) {
  return <p>{props.job.title}</p>;
}

export async function getServerSideProps(context: any) {
  let jobid = context.query.jobId;
  const job = await getJobByJobId(jobid);
  console.log('job', job);
  return {
    props: {
      job: job,
    },
  };
}
