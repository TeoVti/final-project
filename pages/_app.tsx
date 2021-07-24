import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-quill/dist/quill.snow.css';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const [username, setUsername] = useState<string>();

  // Declare a function that we will use in any page or
  // component (via passing props) to refresh the
  // username (if it has gotten out of date)
  const refreshUsername =
    // useCallback: Prevent this function from getting
    // a different reference on every rerender
    //
    // We do this to prevent calls to the API on
    // every page navigation
    useCallback(async () => {
      // Call the API to retrieve the user information
      // by automatically passing along the sessionToken cookie
      const response = await fetch('/api/profile');
      const json = await response.json();

      // If there are errors, return early
      if ('errors' in json) {
        // TODO: Handle errors - show to the user
        return;
      }

      // Set the username state variable which we can use
      // in other components via passing props
      setUsername(json.user?.username);
    }, []);

  // Retrieve username information ONCE the first time
  // that a user loads the page
  useEffect(() => {
    refreshUsername();
  }, [refreshUsername]);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <Component
        refreshUsername={refreshUsername}
        username={username}
        {...pageProps}
      />
    </>
  );
}
