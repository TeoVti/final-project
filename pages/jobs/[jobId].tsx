import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../Components/Layout';
import { getEmailByJobId, getJobByJobId } from '../../util/database';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function SingleJob(props: any) {
  const router = useRouter();
  async function deleteJobByJobI(id: any) {
    await fetch(`/api/jobs/${props.job.id}`, {
      method: 'DELETE',
    });
    router.push(`/jobs`);
  }
  let email = props.email.email;
  let text = props.job.details;
  return (
    <>
      <Head>
        <title>{props.username}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout username={props.username} />
      <div className="job-page">
        <h3 style={{ textAlign: 'center' }}>{props.job.title}</h3>
        <p>{}</p>
        <div
          dangerouslySetInnerHTML={{ __html: text }}
          className="container-sm"
        ></div>
        <span style={{ marginLeft: '16em', color: 'white !important' }}>
          {props.username ? (
            <button
              onClick={() => deleteJobByJobI(props.job.id)}
              className="delete-job"
            >
              Delete Job
            </button>
          ) : (
            <a href={`mailto:${email}`} className="see-job">
              Apply
            </a>
          )}
        </span>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  if (
    context.req.headers.host &&
    context.req.headers['x-forwarded-proto'] &&
    context.req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return {
      redirect: {
        destination: `https://${context.req.headers.host}/jobs`,
        permanent: true,
      },
    };
  }

  let jobid = context.query.jobId;
  const job = await getJobByJobId(jobid);
  const email = await getEmailByJobId(jobid);
  return {
    props: {
      job: job,
      email: email || null,
    },
  };
}
