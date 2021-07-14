import Link from 'next/link';
import { useRouter } from 'next/router';

type Props = {
  username?: string;
};

export default function Header(props: Props) {
  const router = useRouter();
  return (
    <header className="header">
      <img className="logo" src="/logo.png" alt="hero"></img>
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
        <span className={router.pathname == '/about' ? 'active' : ''}>
          <Link href="/about">
            <a className="about-us">About Us</a>
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
