import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";

const Nav = () => (
  <NavStyles>
    <User>
      {({ data: { me } }) => {
        console.log(me);
        if (me) return <p>{me.name}</p>;
        return null;
      }}
    </User>
    <Link href="/items">
      <a>Shop</a>
    </Link>
    <Link href="/sell">
      <a>Sell</a>
    </Link>
    <Link href="/register">
      <a>Register</a>
    </Link>
    <Link href="/orders">
      <a>Orders</a>
    </Link>
    <Link href="/account">
      <a>Account</a>
    </Link>
  </NavStyles>
);

export default Nav;
