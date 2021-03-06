import cookie from 'cookie';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import Layout from '../Components/Layout';
import { deleteSessionByToken } from '../util/database';

type Props = {
  refreshUsername: () => void;
  username?: string;
};

export default function Logout(props: Props) {
  // useEffect because this should run when the page loads
  useEffect(() => props.refreshUsername(), [props]);
  return (
    <div>
      <Head>
        <title>Logout</title>
      </Head>
      <Layout username={props.username} />
      <div>
        <h1 className="logout-text">You{"'"}ve successfully logged out</h1>
        <div style={{ marginTop: '12em'}}>
          <div className="square-reg"></div>
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img className="reg-dots" src="/dots.png" alt="hero"></img>
          }
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const sessionToken = context.req.cookies.sessionToken;

  if (sessionToken) {
    await deleteSessionByToken(sessionToken);
  }
  // Note: if you want to redirect the user when they have no session
  // token, you could return an object with the `redirect` prop
  // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering

  // Instruct the browser to delete the cookie
  context.res.setHeader(
    'Set-Cookie',
    cookie.serialize('sessionToken', '', {
      maxAge: -1,
      path: '/',
    }),
  );

  return {
    props: {},
  };
}
