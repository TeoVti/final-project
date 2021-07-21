import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

type Props = {
  username?: string;
};

export default function Header(props: Props) {
  const router = useRouter();
  const [navBackground, setNavBackground] = useState(false);
  const navRef = useRef();
  navRef.current = navBackground;
  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > 50;
      if (navRef.current !== show) {
        setNavBackground(show);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <header
      className="header"
      style={{
        transition: '1s',
        backgroundColor: navBackground ? 'white' : 'transparent',
      }}
    >
      <Link href="/" passHref>
        <div className="logo-name">
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img className="logo" src="/logo.png" alt="hero"></img>
          }
          <h4>MedJobs</h4>
        </div>
      </Link>
      <div className="nav">
        <span className={router.pathname == '/' ? 'active' : ''}>
          <Link href="/">
            <a>Home</a>
          </Link>
        </span>
        <span
          className={router.pathname == '/jobs' ? 'active' : ''}
          id="jobs-link"
        >
          <Link href="/jobs">
            <a>Jobs</a>
          </Link>
        </span>
        <span className={router.pathname == '/login' ? 'active' : ''}>
          {props.username ? (
            <Link href="/logout">
              <a>Logout</a>
            </Link>
          ) : (
            <Link href="/login">
              <a>Login</a>
            </Link>
          )}
        </span>
      </div>
    </header>
  );
}
