import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   CREATE ADMIN
========================= */
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ========= VALIDATION ========= */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* ========= CHECK ADMIN ========= */
    const existingAdmin = await Admin.findOne({ email })
      .select("_id")
      .lean();

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    /* ========= HASH PASSWORD ========= */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* ========= CREATE ADMIN ========= */
    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    /* ========= RESPONSE ========= */
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* =========================
   ADMIN LOGIN
========================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ========= VALIDATION ========= */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* ========= FIND ADMIN ========= */
    const admin = await Admin.findOne({ email }).lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    /* ========= CHECK PASSWORD ========= */
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ========= JWT TOKEN ========= */
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* ========= RESPONSE ========= */
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
