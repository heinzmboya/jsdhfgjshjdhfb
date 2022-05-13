import { gql } from 'graphql-tag'

export const BOOKS = gql`
query {
    book {
      pages {
        content
        tokens {
          position
          value
        }
      }
    }
  }
`
