import Header from './Header';

export default function Layout(props) {
  return (
    <>
      <Header username={props.username}>{props.children}</Header>
    </>
  );
}
