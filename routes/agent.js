const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Agent } = require('../models');
const { getAgentStatus } = require('../utils/session');
const { verifyToken } = require('../middleware/auth');


const router = express.Router();

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

// Route pour vérifier le statut d'un agent
router.get('/status/:id', verifyToken, (req, res) => {
  const agentId = req.params.id;

  getAgentStatus(agentId, (err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du statut.' });
    }

    if (!status) {    console.log('bla');

      return res.status(404).json({ error: `Statut de l'agent ${agentId} introuvable.` });
    
    }

    res.json({ agentId, status });
  });
});

module.exports = router;
