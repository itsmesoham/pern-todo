const router = require("express").Router();
const pool = require("./db");
const PDFDocument = require("pdfkit");

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await pool.query(
            `SELECT 
                t.*, 
                u1.username AS created_by, 
                u2.username AS updated_by
            FROM todo t
            LEFT JOIN users u1 ON t.created_by = u1.user_id
            LEFT JOIN users u2 ON t.updated_by = u2.user_id
            WHERE t.todo_id = $1`,
            [id]
        );

        if (todo.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        const data = todo.rows[0];

        // Create PDF
        const doc = new PDFDocument();

        // Set headers BEFORE piping
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition", 
            `attachment; filename=todo_${id}.pdf`
        );

        // Pipe to client
        doc.pipe(res);

        doc.fontSize(20).text("Todo Details", { underline: true });
        doc.moveDown();

        doc.fontSize(14).text(`Description: ${data.description}`);
        doc.text(`Amount: ${data.amount}`);
        doc.text(`Created At: ${data.created_at}`);
        doc.text(`Updated At: ${data.updated_at}`);
        doc.text(`Created By: ${data.created_by}`);
        doc.text(`Updated By: ${data.updated_by}`);

        doc.end();

    } catch (err) {
        console.error("PDF ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;