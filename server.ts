import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/summary", async (req, res) => {
    try {
      const { useCase, teamSize, totalSpend, totalSavings, toolBreakdown } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze the following AI spend audit and provide a ~100-word personalized summary. 
        Focus on the biggest savings opportunities and strategic alignment. 
        Be professional, encouraging, and data-driven.

        Input Data:
        - Primary Use Case: ${useCase}
        - Team Size: ${teamSize}
        - Current Monthly Spend: $${totalSpend}
        - Estimated Monthly Savings: $${totalSavings}
        - Tool Breakdown: ${JSON.stringify(toolBreakdown)}

        Output: A single paragraph, no markdown bolding, no bullet points.
      `;

      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();
      
      res.json({ summary });
    } catch (error) {
      console.error("AI Summary Error:", error);
      res.status(500).json({ summary: "We've calculated your savings! Review your personalized tool breakdown below." });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const { email, company, auditId, totalSavings } = req.body;
      
      // Resend Email (Optional - only if key exists)
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Orbit AI Audit <onboarding@resend.dev>',
          to: email,
          subject: 'Your AI Spend Audit is Ready!',
          html: `<p>Hi ${company ? `from ${company}` : ''},</p>
                 <p>Your AI Spend Audit is complete. You have a potential saving of <strong>$${totalSavings}</strong> per month!</p>
                 <p>View your full report here: <a href="${process.env.APP_URL}/share/${auditId}">${process.env.APP_URL}/share/${auditId}</a></p>
                 ${totalSavings > 500 ? '<p>Since your savings are over $500/mo, we recommend booking a Credex consultation to capture even more value.</p>' : ''}
                 <p>Best,<br>The Orbit Team</p>`
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Lead/Email Error:", error);
      res.status(500).json({ error: "Failed to process lead" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
