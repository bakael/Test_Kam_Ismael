const express = require('express');
const { Message, Conversation } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { notifyAgent } = require('../websocket');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         conversation_id:
 *           type: integer
 *         content:
 *           type: string
 *         sender_type:
 *           type: string
 *         sender_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         conversation_id: 1
 *         content: "Bonjour, comment puis-je vous aider ?"
 *         sender_type: "agent"
 *         sender_id: 1
 *         created_at: "2024-08-10T10:00:00.000Z"
 */

/**
 * @swagger
 * /new/messages:
 *   post:
 *     summary: Envoyer un message dans une conversation
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: integer
 *               content:
 *                 type: string
 *               sender_type:
 *                 type: string
 *             example:
 *               conversation_id: 1
 *               content: "Bonjour, comment puis-je vous aider ?"
 *               sender_type: "agent"
 *     responses:
 *       201:
 *         description: Message créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur lors de l'envoi du message
 */
// Envoyer un message dans une conversation
router.post('/new', verifyToken, async (req, res) => {
  try {
    const { conversation_id, content, sender_type } = req.body;

    const conversation = await Conversation.findByPk(conversation_id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const message = await Message.create({
      conversation_id,
      content,
      sender_type,
      sender_id: req.agentId, // Ou un autre ID si l'utilisateur n'est pas un agent
      created_at: new Date()
    });

    // Notification de nouveaux message
    notifyAgent(conversation.assigned_agent_id, {
      type: 'new_message',
      message: `Nouveau message dans la conversation ${conversation_id}`,
      conversation_id: conversation_id
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

/**
 * @swagger
 * /conversations/{id}/messages:
 *   get:
 *     summary: Récupérer tous les messages d'une conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la conversation
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur lors de la récupération des messages
 */

// Récupérer tous les messages d'une conversation
router.get('/conversations/:id/messages', verifyToken, async (req, res) => {
    try {
      const conversationId = req.params.id;
  
      const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        order: [['created_at', 'ASC']]
      });
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
    }
  });
  
  module.exports = router;
  

module.exports = router;
