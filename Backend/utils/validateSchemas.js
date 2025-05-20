const { z } = require("zod");

const userSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().optional(),
});

module.exports = { userSchema };
