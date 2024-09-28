const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Agent } = require('../models');
const { getAgentStatus } = require('../utils/session');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: L'ID auto-généré de l'agent.
 *         username:
 *           type: string
 *           description: Le nom d'utilisateur de l'agent.
 *         password:
 *           type: string
 *           description: Le mot de passe haché de l'agent.
 */

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: Gestion des agents
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Inscription d'un nouvel agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Le nom d'utilisateur de l'agent.
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'agent.
 *     responses:
 *       201:
 *         description: Agent créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Erreur lors de l'inscription de l'agent.
 */



// Route pour l'inscription d'un agent
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = await Agent.create({ username, password: hashedPassword });
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription de l\'agent.' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Le nom d'utilisateur de l'agent.
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'agent.
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un jeton JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Jeton JWT pour l'authentification.
 *       401:
 *         description: Utilisateur non trouvé ou mot de passe incorrect.
 *       500:
 *         description: Erreur lors de la connexion de l'agent.
 */

// Route pour la connexion d'un agent
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const agent = await Agent.findOne({ where: { username } });
    if (!agent) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const validPassword = await bcrypt.compare(password, agent.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: agent.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion de l\'agent.' });
  }
});

/**
 * @swagger
 * /status/{id}:
 *   get:
 *     summary: Vérifier le statut d'un agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'agent
 *     responses:
 *       200:
 *         description: Statut de l'agent récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agentId:
 *                   type: string
 *                   description: L'ID de l'agent.
 *                 status:
 *                   type: string
 *                   description: Le statut de l'agent.
 *       404:
 *         description: Statut de l'agent introuvable.
 *       500:
 *         description: Erreur lors de la récupération du statut.
 */

// Route pour vérifier le statut d'un agent
router.get('/status/:id', verifyToken, (req, res) => {
  const agentId = req.params.id;

  getAgentStatus(agentId, (err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du statut.' });
    }

    if (!status) {   

      return res.status(404).json({ error: `Statut de l'agent ${agentId} introuvable.` });
    
    }

    res.json({ agentId, status });
  });
});

module.exports = router;
