const express = require("express");
const axios = require("axios");
const router = express.Router();

require("dotenv").config();

const SUPERSET_URL = "https://beanflow-superset-production.up.railway.app";
const SUPERSET_API = `${SUPERSET_URL}/api/v1/security`;

router.get("/api/superset-token/:dashboardId", async (req, res) => {
  const { dashboardId } = req.params;

  if (!dashboardId || typeof dashboardId !== "string") {
    return res.status(400).json({ error: "Parâmetro 'dashboardId' inválido." });
  }

  try {
    // Login para obter o access token
    const loginResponse = await axios.post(`${SUPERSET_API}/login`, {
      username: process.env.SUPERSET_USER,
      password: process.env.SUPERSET_PASS,
      provider: "db",
      refresh: true,
    });

    const accessToken = loginResponse.data.access_token;

    // Gera o guest token
    const guestTokenResponse = await axios.post(
      `${SUPERSET_API}/guest_token/`,
      {
        resources: [{ type: "dashboard", id: dashboardId }],
        rls: [],
        user: {
          username: "lucas.dev",
          first_name: "Lucas",
          last_name: "Azevedo",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ token: guestTokenResponse.data.token });

  } catch (err) {
    console.error("Erro ao gerar token:", err.response?.data || err.message, err.stack);
    res.status(500).json({ error: "Erro ao gerar token" });
  }
});

module.exports = router;