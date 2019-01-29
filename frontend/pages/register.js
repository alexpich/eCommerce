import Register from "../components/Register";
import Signin from "../components/Signin";
import styled from "styled-components";
import RequestReset from "../components/RequestReset";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const register = props => (
  <Columns>
    <Register />
    <Signin />
    <RequestReset />
  </Columns>
);

export default register;
