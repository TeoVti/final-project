import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../Components/Layout';
import { getValidSessionByToken } from '../util/database';
import { LoginResponse } from './api/login';

type Props = {
  refreshUsername: () => void;
  username?: string;
};

export default function Login(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Register</title>
      </Head>
      <Layout username={props.username} />
      <div className="login-page"></div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          // Send the username and password to the API
          // for verification
          const response = await fetch(`/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              password: password,
            }),
          });

          const json = (await response.json()) as LoginResponse;

          if ('errors' in json) {
            setError(json.errors[0].message);
            return;
          }
          props.refreshUsername();
          // Navigate to the user's page when
          // they have been successfully created
          router.push(`/jobs`);
        }}
      >
        <div>
          <div>
            <h2>
              <u>Login</u>
            </h2>
            <div>
              <label>
                <input
                  data-cy="users-management-create-username"
                  value={username}
                  placeholder="Username"
                  onChange={(event) => {
                    setUsername(event.currentTarget.value);
                  }}
                />
              </label>
            </div>

            <div>
              <label>
                <input
                  data-cy="users-management-create-password"
                  value={password}
                  placeholder="Password"
                  type="password"
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                  }}
                />
              </label>
            </div>

            <button>Login</button>

            <div>{error}</div>
          </div>
        </div>
      </form>
      <div>
        <h2>Don't have an account?</h2>
        <Link href="/register">
          <a className="register">Register</a>
        </Link>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Redirect from HTTP to HTTPS on Heroku
  const sessionToken = context.req.cookies.sessionToken;
  // console.log('sessionToken on login.tsx in gSSP', sessionToken);

  const session = await getValidSessionByToken(sessionToken);

  if (session) {
    // Redirect the user when they have a session
    // token by returning an object with the `redirect` prop
    // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
    return {
      redirect: {
        destination: `/about`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
