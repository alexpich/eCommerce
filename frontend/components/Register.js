import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const REGISTER_MUTATION = gql`
  mutation REGISTER_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    register(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

class Register extends Component {
  state = {
    name: "",
    password: "",
    email: ""
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        mutation={REGISTER_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(register, { error, loading }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                await register();
                this.setState({ name: "", email: "", password: "" });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Create An Account</h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    name="name"
                    placeholder="name"
                    value={this.state.name}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Submit</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Register;
