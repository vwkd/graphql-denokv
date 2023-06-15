import { assertEquals, graphql } from "../deps.ts";
import { buildSchema } from "../src/main.ts";

Deno.test("minimal working example", async () => {
  const schemaSource = `
    type Query {
      bookById(id: ID): Book
    }

    type Book {
      id: ID,
      title: String,
    }
  `;

  const source = `
    query {
      bookById(id: 1) {
        id,
        title,
      }
    }
  `;

  const db = await Deno.openKv(":memory:");
  await db.atomic()
    .set(["Book", "1"], {
      id: "1",
      title: "Shadows of Eternity",
    })
    .commit();

  const schema = buildSchema(db, schemaSource);

  const res = await graphql({ schema, source });

  const exp = {
    data: {
      bookById: {
        id: "1",
        title: "Shadows of Eternity",
      },
    },
  };

  db.close();

  assertEquals(res, exp);
});

Deno.test("null row", async () => {
  const schemaSource = `
    type Query {
      bookById(id: ID): Book
    }

    type Book {
      id: ID,
      title: String,
    }
  `;

  const source = `
    query {
      bookById(id: 999) {
        id,
        title,
      }
    }
  `;

  const db = await Deno.openKv(":memory:");
  await db.atomic()
    .set(["Book", "1"], {
      id: "1",
      title: "Shadows of Eternity",
    })
    .commit();

  const schema = buildSchema(db, schemaSource);

  const res = await graphql({ schema, source });

  const exp = {
    data: {
      bookById: null,
    },
  };

  db.close();

  assertEquals(res, exp);
});

Deno.test("null column", async () => {
  const schemaSource = `
    type Query {
      bookById(id: ID): Book
    }

    type Book {
      id: ID,
      title: String,
    }
  `;

  const source = `
    query {
      bookById(id: 1) {
        id,
        title,
      }
    }
  `;

  const db = await Deno.openKv(":memory:");
  await db.atomic()
    .set(["Book", "1"], {
      id: "1",
    })
    .commit();

  const schema = buildSchema(db, schemaSource);

  const res = await graphql({ schema, source });

  const exp = {
    data: {
      bookById: {
        id: "1",
        title: null,
      },
    },
  };

  db.close();

  assertEquals(res, exp);
});
