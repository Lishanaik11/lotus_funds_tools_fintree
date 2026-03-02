import { Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "../middlewares/auth.middleware";

export const exitResearchCall = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Call ID is required" });
        }

        const result = await pool.query(
            `
      UPDATE research_calls
      SET 
        status = 'CLOSED',
        exit_price = 0,
        closed_at = NOW()
      WHERE id = $1
      RETURNING *;
      `,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Call not found" });
        }

        return res.status(200).json({
            message: "Call exited successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Exit Call Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};