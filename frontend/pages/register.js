import Register from "../components/Register";
import Signin from "../components/Signin";
import styled from "styled-components";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const register = props => (
  <Columns>
    <Register />
    <Signin />
  </Columns>
);

export default register;
