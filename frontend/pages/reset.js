import Reset from "../components/Reset";

const ResetPage = props => (
  <div>
    <p>Reset Password {props.query.resetToken}</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
);

export default ResetPage;
