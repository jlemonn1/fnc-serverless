import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hf } from "../../src/config/hf.js";
import { logger } from "../../src/utils/logger.js";

const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("HF_TOKEN:", process.env.HF_TOKEN ? "✅ cargado" + process.env.HF_TOKEN : "❌ no detectado");

    if (req.method !== "POST")
        return res.status(405).json({ error: "Método no permitido" });

    try {
        const { mode, prompt, imageBase64 } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt requerido" });

        let payload: Record<string, unknown> = { inputs: prompt };
        if (mode === "img2img" && imageBase64)
            payload = { inputs: prompt, image: imageBase64 };

        const response = await hf.post(`/${MODEL}`, payload, {
            responseType: "arraybuffer",
            headers: {
                Accept: "image/png",
                "Content-Type": "application/json", // ✅ Fix serverless
            },
        });

        const buffer = Buffer.from(response.data, "binary");
        const imageUrl = `data:image/png;base64,${buffer.toString("base64")}`;

        logger.info("✅ Imagen generada correctamente");
        return res.status(200).json({ imageUrl });
    } catch (err: any) {
        logger.error(err.response?.data || err.message);
        return res.status(500).json({ error: "Error generando la imagen" });
    }
}
