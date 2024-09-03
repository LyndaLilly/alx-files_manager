import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import userUtils from '../utils/user';

const userQueue = new Queue('userQueue');

class UsersController {
  /**
   * Handles user registration using email and password.
   *
   * To register a user, an email and password must be provided.
   * - If the email is missing, respond with a 400 status code and an error message 'Missing email'.
   * - If the password is missing, respond with a 400 status code and an error message 'Missing password'.
   * - If the email is already registered, respond with a 400 status code and an error message 'Already exist'.
   *
   * The password is hashed using SHA1 before being stored.
   * Upon successful creation, return the new user's email and auto-generated ID (from MongoDB) with a 201 status code.
   *
   * The user data is stored in the 'users' collection with the following fields:
   * - email: as received from the request
   * - password: the SHA1-hashed value of the received password
   */
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) return response.status(400).send({ error: 'Missing email' });

    if (!password) { return response.status(400).send({ error: 'Missing password' }); }

    const emailExists = await dbClient.usersCollection.findOne({ email });

    if (emailExists) { return response.status(400).send({ error: 'Already exist' }); }

    const sha1Password = sha1(password);

    let result;
    try {
      result = await dbClient.usersCollection.insertOne({
        email,
        password: sha1Password,
      });
    } catch (err) {
      await userQueue.add({});
      return response.status(500).send({ error: 'Error creating user.' });
    }

    const user = {
      id: result.insertedId,
      email,
    };

    await userQueue.add({
      userId: result.insertedId.toString(),
    });

    return response.status(201).send(user);
  }

  /**
   * Retrieves the authenticated user's details based on the provided token.
   *
   * - If the user is not found, respond with a 401 status code and an 'Unauthorized' error message.
   * - If the user is found, return their email and ID only, excluding other details such as the password.
   */
  static async getMe(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const processedUser = { id: user._id, ...user };
    delete processedUser._id;
    delete processedUser.password;

    return response.status(200).send(processedUser);
  }
}

export default UsersController;
