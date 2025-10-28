import axios from "axios";

export const hf = axios.create({
  baseURL: "https://api-inference.huggingface.co/models",
  headers: {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
  },
});
