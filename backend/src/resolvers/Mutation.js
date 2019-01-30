const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
// Takes callback based functions and turns them into promise based functions
const { promisify } = require("util");
const { transport, createEmailTemplate } = require("../mail");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // Creates a relationship between item and user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    console.log(item);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // Take a copy of the updates
    const updates = { ...args };

    // Remove the ID from the updates
    delete updates.id;

    // Run update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // find the item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // TODO check if user owns that item or is authorized to delete it

    // delete
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async register(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    // Hash password (password, length)
    const password = await bcrypt.hash(args.password, 10);

    // Create user and add to database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          // shorthand for password: password
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set JWT as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month cookie
    });

    // Return user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // Check if user exists with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`${email} appears to be an invalid email.`);
    }

    // Check if password is correct, compare the hashes
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("You have entered an invalid username or password.");
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month cookie
    });

    // Return user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Sign out successful!" };
  },
  async requestReset(parent, args, ctx, info) {
    // Check if real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    // Set reset token and expiry on the user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(30)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    // Email reset token
    const mailRes = await transport.sendMail({
      from: "test@gmail.com",
      to: user.email,
      subject: "Password Reset Link",
      html: createEmailTemplate(
        `Your password reset token is: \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset</a>`
      )
    });

    // Return message
    return { message: "Success" };
  },
  async resetPassword(parent, args, ctx, info) {
    // Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Check if reset token is legit

    // Check if token expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000 // greater than or equal
      }
    });
    if (!user) {
      throw new Error("Token is invalid or expired");
    }
    // Hash new password
    const password = await bcrypt.hash(args.password, 10);

    // Save new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    // Set JWT cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month
    });

    // Return new user
    return updatedUser;
  }
};

module.exports = Mutations;
