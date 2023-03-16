import { gql } from "@apollo/client";

export const GET_ROOMS = gql(/* GraphQL */ `
query ClientsWithRooms {
  clientsWithRooms {
    assignedVet
    description
    id
    roomCreatedAt
    roomId
  }
}
`)

export const ME = gql`
query Me {
  me {
    id
    name
    qualification
    available
  }
}
`