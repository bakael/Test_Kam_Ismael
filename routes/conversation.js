const express = require('express');
const { Conversation, Assignment, Closure } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { notifyAgent } = require('../websocket');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: L'ID de la conversation.
 *         status:
 *           type: string
 *           description: Le statut de la conversation (e.g., ouverte, fermée).
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création de la conversation.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date de la dernière mise à jour de la conversation.
 *     Assignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: L'ID de l'assignation.
 *         conversation_id:
 *           type: string
 *           description: L'ID de la conversation assignée.
 *         agent_id:
 *           type: string
 *           description: L'ID de l'agent à qui la conversation est assignée.
 *         assigned_at:
 *           type: string
 *           format: date-time
 *           description: Date de l'assignation.
 *     Closure:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: L'ID de la clôture.
 *         conversation_id:
 *           type: string
 *           description: L'ID de la conversation clôturée.
 *         closure_reason:
 *           type: string
 *           description: La raison de la clôture.
 *         closed_at:
 *           type: string
 *           format: date-time
 *           description: Date de la clôture.
 */

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Gestion des conversations
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Lister les conversations assignées à un agent
 *     tags: [Conversations]
 *     responses:
 *       200:
 *         description: Liste des conversations récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Erreur lors de la récupération des conversations.
 */
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


/**
 * @swagger
 * /{id}/assign:
 *   post:
 *     summary: Prendre en charge une conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la conversation à assigner
 *     responses:
 *       200:
 *         description: Conversation assignée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       500:
 *         description: Erreur lors de l'assignation de la conversation.
 */

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


/**
 * @swagger
 * /{id}/close:
 *   post:
 *     summary: Clôturer une conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la conversation à clôturer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               closure_reason:
 *                 type: string
 *                 description: La raison de la clôture de la conversation.
 *     responses:
 *       200:
 *         description: Conversation clôturée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Closure'
 *       500:
 *         description: Erreur lors de la clôture de la conversation.
 */

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
