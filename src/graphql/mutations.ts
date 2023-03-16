import { gql } from "@apollo/client"

export const LOGIN_USER = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    value
  }
}
`

export const CREATE_USER = gql`
mutation CreateVetUser($username: String!, $name: String!, $qualification: String!) {
  createVetUser(username: $username, name: $name, qualification: $qualification) {
    name
    qualification
  }
}
`

export const EDIT_VET = gql`
mutation EditVet($editVetId: ID!, $qualification: String, $name: String, $available: Boolean) {
  editVet(id: $editVetId, qualification: $qualification, name: $name, available: $available) {
    qualification
    name
    id
    available
  }
}
`