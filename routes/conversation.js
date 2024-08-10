const express = require('express');
const { Conversation, Assignment, Closure } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { notifyAgent } = require('../websocket');

const router = express.Router();

// Route pour lister les conversations assignées à un agent
router.get('/', verifyToken, async (req, res) => {
  try {
    const conversations = await Assignment.findAll({
      where: { agent_id: req.agentId },
      include: [Conversation]
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations.' });
  }
});

// Route pour prendre en charge une conversation
router.post('/:id/assign', verifyToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const assignment = await Assignment.create({
      conversation_id: conversationId,
      agent_id: req.agentId,
      assigned_at: new Date()
    });

    const notification = {
        type: 'assignment',
        message: `Nouvelle conversation assignée : ${conversationId}`
    };
    notifyAgent(req.agentId, notification);

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la conversation.' });
  }
});

// Route pour clôturer une conversation
router.post('/:id/close', verifyToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { closure_reason } = req.body;

    const closure = await Closure.create({
      conversation_id: conversationId,
      closure_reason,
      closed_at: new Date()
    });

    const conversation = await Conversation.findByPk(conversationId);
    conversation.status = 'closed';
    await conversation.save();

    res.json(closure);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la clôture de la conversation.' });
  }
});

module.exports = router;
