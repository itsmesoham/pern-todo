const express = require("express");
const router = express.Router();
const fs = require("fs");
const sendGoogleEmail = require("./sendGoogleEmail");
const { generatePDF } = require("./printTodo");

router.post("/", async (req, res) => {
    try {
        const { to, subject, message, todo_id } = req.body;

        console.log("Received todo_id:", todo_id);

        if (!to || !subject || !message || !todo_id) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // generate the PDF path
        const pdfPath = await generatePDF(todo_id);

        const pdfData = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfData.toString("base64");

        const emailBody =
            `From: "Soham" <${process.env.GC_SENDER_EMAIL}>
To: ${to}
Subject: ${subject}
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset="UTF-8"

${message}

--boundary123
Content-Type: application/pdf
Content-Disposition: attachment; filename="todo_${todo_id}.pdf"
Content-Transfer-Encoding: base64

${pdfBase64}

--boundary123--`;

        await sendGoogleEmail(emailBody);

        res.json({ success: true, message: "Email sent with PDF!" });

    } catch (err) {
        console.error("SEND EMAIL ERROR →", err);
        res.status(500).json({ error: "Failed to send email" });
    }
});

module.exports = router;