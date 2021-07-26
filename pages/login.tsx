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
        <title>Log in</title>
      </Head>
      <Layout username={props.username} />
      <div className="login-page">
        <div className="register-card">
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
                <h3 className="log-in-text">Log in to MedJobs</h3>
                <div>
                  <label>
                    <input
                      className="register-input"
                      data-cy="users-management-create-username"
                      value={username}
                      placeholder="Institution Name"
                      onChange={(event) => {
                        setUsername(event.currentTarget.value);
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label>
                    <input
                      className="register-input"
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

                <button className="create-account">Log in</button>

                <div>{error}</div>
              </div>
            </div>
          </form>
          <div style={{ marginTop: '1em' }}>
            {
              // eslint-disable-next-line react/no-unescaped-entities
              <h5>Don't have an account?</h5>
            }
            <Link href="/register">
              <a className="register">Register here</a>
            </Link>
          </div>
        </div>
        <div>
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
  // Redirect from HTTP to HTTPS on Heroku
  // Redirect from HTTP to HTTPS on Heroku
  if (
    context.req.headers.host &&
    context.req.headers['x-forwarded-proto'] &&
    context.req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return {
      redirect: {
        destination: `https://${context.req.headers.host}/login`,
        permanent: true,
      },
    };
  }
  const sessionToken = context.req.cookies.sessionToken;
  // console.log('sessionToken on login.tsx in gSSP', sessionToken);

  const session = await getValidSessionByToken(sessionToken);

  if (session) {
    // Redirect the user when they have a session
    // token by returning an object with the `redirect` prop
    // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
    return {
      redirect: {
        destination: `/jobs`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
