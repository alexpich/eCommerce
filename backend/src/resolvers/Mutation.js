const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
  }
};

module.exports = Mutations;
