import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpMail, sendApprovalMail } from "../config/mailer";
import crypto from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware";

/* ================= ADMIN APPROVE USER ================= */
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ message: "userId and type required" });
    }

    let userData: { id: string; name: string; email: string; role: string };

    // ================= GET DETAILS =================
    if (type === "RA") {
      const result = await pool.query(
        `SELECT first_name, surname, email FROM ra_details WHERE id=$1`,
        [userId]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: "RA not found" });

      const ra = result.rows[0];

      userData = {
        id: crypto.randomUUID(),
        name: `${ra.first_name} ${ra.surname}`,
        email: ra.email.trim().toLowerCase(),
        role: "RESEARCH_ANALYST",
      };
    } else if (type === "BROKER") {
      const result = await pool.query(
        `SELECT legal_name, email FROM broker_details WHERE id=$1`,
        [userId]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: "Broker not found" });

      const broker = result.rows[0];

      userData = {
        id: crypto.randomUUID(),
        name: broker.legal_name,
        email: broker.email.trim().toLowerCase(),
        role: "BROKER",
      };
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    // ================= CHECK EXISTING USER =================
    const existing = await pool.query(
      `SELECT id, status FROM users WHERE email = $1`,
      [userData.email]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      if (user.status === "active") {
        return res.status(400).json({
          message: "User already active ❌",
        });
      }

      // 🔥 IMPORTANT: restore deleted/inactive user instead of inserting new
      await pool.query(
        `
        UPDATE users 
        SET name=$1,
            role=$2,
            status='inactive'
        WHERE email=$3
        `,
        [userData.name, userData.role, userData.email]
      );
    } else {
      // ================= INSERT NEW USER =================
      const tempPassword = await bcrypt.hash("temp123", 10);

      await pool.query(
        `
        INSERT INTO users 
        (id, name, email, username, password_hash, role, status, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
        `,
        [
          userData.id,
          userData.name,
          userData.email,
          userData.email.split("@")[0],
          tempPassword,
          userData.role,
          "inactive",
        ]
      );
    }

    // ================= CREATE RESET TOKEN =================
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `
      UPDATE users 
      SET reset_token=$1, token_expiry=$2
      WHERE email=$3
      `,
      [token, new Date(Date.now() + 60 * 60 * 1000), userData.email]
    );

    // ================= UPDATE DETAILS TABLE =================
    if (type === "RA") {
      await pool.query(
        `UPDATE ra_details SET status='approved' WHERE email=$1`,
        [userData.email]
      );
    } else {
      await pool.query(
        `UPDATE broker_details SET status='approved' WHERE email=$1`,
        [userData.email]
      );
    }

    // ================= SEND EMAIL =================
    const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
    await sendApprovalMail(userData.email, userData.name, link);

    return res.json({
      success: true,
      message: `${type} approved successfully ✅`,
    });

  } catch (error) {
    console.error("Approve Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= SEND OTP AFTER PASSWORD ================= */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Token required" });

    const userRes = await pool.query(
      `SELECT * FROM users WHERE reset_token=$1 AND token_expiry > NOW()`,
      [token]
    );

    if (userRes.rows.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = userRes.rows[0];

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
      `UPDATE users SET otp=$1, otp_expiry=$2 WHERE id=$3`,
      [otp, otpExpiry, user.id]
    );

    await sendOtpMail(user.email, otp);

    return res.json({ message: "OTP sent successfully ✅" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { token, otp, password } = req.body;

    if (!token || !otp || !password)
      return res.status(400).json({ message: "Token, OTP and password required" });

    const userRes = await pool.query(`SELECT * FROM users WHERE reset_token=$1`, [token]);

    if (userRes.rows.length === 0) return res.status(400).json({ message: "Invalid token" });

    const user = userRes.rows[0];

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Activate user
    await pool.query(
      `UPDATE users 
       SET password_hash=$1, status='active', otp=NULL, otp_expiry=NULL, reset_token=NULL
       WHERE id=$2`,
      [hashedPassword, user.id]
    );

    return res.json({ message: "Password set successfully ✅" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= Login ================= */
export const login = async (req: Request, res: Response) => {
  try {
    let { loginId, password } = req.body;

    // ✅ Normalize input
    loginId = loginId.trim().toLowerCase();

    console.log("LOGIN INPUT:", loginId);

    let user;

    /* ================= ADMIN LOGIN (STRICT) ================= */
    if (loginId === "admin") {
      const adminRes = await pool.query(
        `SELECT id, username, password_hash, role 
         FROM company_users 
         WHERE LOWER(username) = $1`,
        [loginId]
      );

      if (adminRes.rows.length === 0) {
        return res.status(400).json({ message: "Admin not found ❌" });
      }

      user = adminRes.rows[0];

    } else {
      /* ================= NORMAL USERS ================= */
      const userRes = await pool.query(
        `SELECT id, email, username, password_hash, role, status
         FROM users 
         WHERE LOWER(email) = $1`,
        [loginId]
      );

      if (userRes.rows.length === 0) {
        return res.status(400).json({ message: "Invalid credentials ❌" });
      }

      user = userRes.rows[0];

      if (user.status.toLowerCase() !== "active") {
        return res.status(403).json({ message: "Account inactive ❌" });
      }
    }

    /* ================= PASSWORD CHECK ================= */
    const match = await bcrypt.compare(password, user.password_hash);

    console.log("PASSWORD MATCH:", match);

    if (!match) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    /* ================= TOKEN ================= */
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful ✅",
      token,
      role: user.role,
      username: user.email || user.username,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ME ================= */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user;

    // 🔹 Check in company_users (admin)
    const adminRes = await pool.query(
      `SELECT username, id, role FROM company_users WHERE id = $1`,
      [req.user.id]
    );

    if (adminRes.rows.length > 0) {
      user = adminRes.rows[0];
    } else {
      // 🔹 Check in users (RA / Broker)
      const userRes = await pool.query(
        `SELECT email, username, id, role FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ...user,
      username: user.email || user.username, // ✅ FORCE EMAIL
    });

  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= CHANGE ADMIN PASSWORD =================

export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT id, password_hash 
       FROM company_users 
       WHERE id = $1`,
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, admin.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect ❌" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE company_users 
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, adminId]
    );

    return res.json({
      message: "Password updated successfully ✅",
    });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};