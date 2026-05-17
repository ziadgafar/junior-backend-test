import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2b$10$d8EUGe4qvO5BvF/hlGUw2uD9NUyb1IdExI/.In13u7IZCI.qw3DZq", // admin123
    role: "admin",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    password: "$2b$10$uM4TX5uhASWpfFD8KRrWkuKjXb5AcZkupI9Endsk4qSdJIgq0Tjpa", // user123
    role: "user",
  },
];

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};
