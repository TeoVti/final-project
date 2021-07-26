import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../Components/Layout';
import { generateCsrfSecretByToken } from '../util/auth';
import { RegisterResponse } from './api/register';

type Props = {
  refreshUsername: () => void;
  username?: string;
  csrfToken: string;
};

export default function Register(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Register</title>
      </Head>
      <Layout username={props.username} />
      <div className="register-page">
        <div className="register-card">
          <h3 className="reg-text">Join MedJobs</h3>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  username: username,
                  password: password,
                  email: email,
                  csrfToken: props.csrfToken,
                }),
              });
              const json = (await response.json()) as RegisterResponse;

              if ('errors' in json) {
                setError(json.errors[0].message);
                return;
              }

              props.refreshUsername();

              // Navigate to registration successful page when
              // new account has been successfully created
              router.push(`/jobs`);
            }}
          >
            <div>
              <label>
                <input
                  className="register-input"
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
                  value={email}
                  type="email"
                  placeholder="Email"
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                  }}
                />
              </label>
            </div>

            <div>
              <label>
                <input
                  className="register-input"
                  value={password}
                  placeholder="Password"
                  type="password"
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                  }}
                />
              </label>
            </div>
            <button className="create-account">Create Account</button>
            <div>{error}</div>
          </form>
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
  if (
    context.req.headers.host &&
    context.req.headers['x-forwarded-proto'] &&
    context.req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return {
      redirect: {
        destination: `https://${context.req.headers.host}/register`,
        permanent: true,
      },
    };
  }

  const crypto = await import('crypto');
  const { createSerializedRegisterSessionTokenCookie } = await import(
    '../util/cookies'
  );
  const { insertFiveMinuteSessionWithoutUserId, deleteExpiredSessions } =
    await import('../util/database');

  // Import and initialize the `csrf` library
  const Tokens = await (await import('csrf')).default;
  const tokens = new Tokens();

  // Get session information if user is already logged in
  const sessionToken = context.req.cookies.sessionToken;
  const session = await generateCsrfSecretByToken(sessionToken);
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

  await deleteExpiredSessions();

  // Generate 5-minute short-lived session, only for the registration
  const shortLivedSession = await insertFiveMinuteSessionWithoutUserId(
    crypto.randomBytes(64).toString('base64'),
  );

  // Set new cookie for the short-lived session
  const cookie = createSerializedRegisterSessionTokenCookie(
    shortLivedSession.token,
  );
  context.res.setHeader('Set-Cookie', cookie);

  // Use token from short-lived session to generate
  // secret for the CSRF token
  const csrfSecret = generateCsrfSecretByToken(shortLivedSession.token);

  // Create CSRF token
  const csrfToken = tokens.create(csrfSecret);

  return {
    props: {
      // Pass CSRF Token via props
      csrfToken,
    },
  };
}
