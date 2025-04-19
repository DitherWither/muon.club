import { users } from "./schema";
import { hash, verify } from "argon2";
import { type } from "arktype";
import { db } from ".";
import { eq } from "drizzle-orm";

// Define the input schema using arktype
const createUserInput = type({
  displayName: "1 < string < 255", // Required, 1-255 characters
  username: "1 < string < 255", // Required, 1-255 characters
  password: "8 < string < 255", // Required, 8-255 characters
  email: "string.email", // Required, valid email
  pronouns: "string < 50?", // Optional, max 50 characters
  bio: "string < 2048?", // Optional, max 2048 characters
});

// Define the input schema for login
const loginUserInput = type({
  username: "string", // Required, 1-255 characters
  password: "string", // Required, 8-255 characters
});

export async function createUser(input: unknown) {
  // Validate the input using arktype
  const validatedInput = createUserInput.assert(input);

  // Hash the password using argon2
  const hashedPassword = await hash(validatedInput.password);

  // Insert the user into the database
  return (
    await db
      .insert(users)
      .values({
        displayName: validatedInput.displayName,
        username: validatedInput.username,
        password: hashedPassword,
        email: validatedInput.email,
        pronouns: validatedInput.pronouns,
        bio: validatedInput.bio,
      })
      .$returningId()
  )[0].id;
}

export async function loginUser(input: unknown) {
  // Validate the input using arktype
  const validatedInput = loginUserInput.assert(input);

  // Fetch the user from the database by username
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, validatedInput.username))
    .limit(1)
    .execute();

  if (!user.length) {
    throw new Error("Invalid username or password");
  }

  const foundUser = user[0];

  // Verify the password
  const isPasswordValid = await verify(
    foundUser.password,
    validatedInput.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  // Return the user ID or other relevant data
  return { id: foundUser.id, username: foundUser.username };
}

export async function getUserById(userId: number) {
  const user = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      pronouns: users.pronouns,
      bio: users.bio,
      // Exclude sensitive information like password
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute();
  if (!user.length) {
    return null; // User not found
  }
  return user[0];
}

export async function getUserIdByUsername(username: string): Promise<number> {
  // Query the database to find the user ID by username
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
    .execute();

  if (user.length === 0) {
    throw new Error(`User with username "${username}" not found.`);
  }

  return user[0].id;
}
