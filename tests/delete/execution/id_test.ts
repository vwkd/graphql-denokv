import { assertEquals, graphql } from "../../../deps.ts";
import { buildSchema } from "../../../src/main.ts";

Deno.test("null row", async () => {
  const schemaSource = `
    type Query {
      bookById(id: ID!): BookResult
    }

    type Mutation {
      deleteTransaction(data: DeleteInput!): Result
    }

    type BookResult {
      id: ID!
      versionstamp: String!
      value: Book!
    }

    type Book {
      id: ID!,
      title: String,
    }

    input DeleteInput {
      deleteBookById: [Identifier!]! @delete(table: "Book")
    }

    input Identifier {
      id: ID!,
      versionstamp: String!
    }
    
    type Result {
      versionstamp: String!
    }
  `;

  const source = `
    mutation {
      deleteTransaction(data: {
        deleteBookById: [{ id: "999", versionstamp: "00000000000000010000" }]
      }) {
        versionstamp
      }
    }
  `;

  const db = await Deno.openKv(":memory:");

  const schema = buildSchema(db, schemaSource);

  const res = await graphql({ schema, source, contextValue: {} });

  const exp = {
    data: {
      deleteTransaction: null,
    },
  };

  assertEquals(res, exp);

  const key = ["Book", "999"];
  const resDb = await db.get(key);

  const expDb = {
    key,
    value: null,
    versionstamp: null,
  };

  db.close();

  assertEquals(resDb, expDb);
});
