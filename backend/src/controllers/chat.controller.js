import db from "../config/db.js";

//CREATE CONVERSATION

export const createConversation = async(req, res) => {
  try {
    const currentUserId = req.user.id;
    const { participantId } = req.body;

    if (!participantId) { 
      return res.status(400).json({ message: "participantId is required" }); 
    }
    
    if (Number(participantId) === currentUserId) {
      return res.status(400).json({ message: "You cannot create a conversation with yourself" }); 
    }

    const participant = await db.user.findUnique({ 
      where: { id: Number(participantId) } 
    });

    if (!participant) {
      return res.status(404).json({ message: "User not found" }); 
    }

    const conversation = await db.conversation.create({ 
      data: { participants: { create: [ { userId: currentUserId }, { userId: Number(participantId) } ] } }, include: { participants: { include: { user: true } } } 
    });

    return res.status(201).json({
       message: "Conversation created successfully", conversation 
      });


  } catch (error) {
    console.error(error);
    
    return res.status(500).json({
      message: "Internal Server Error"
    });
    
    }
}

//GET MY CONVERSATIONS
export const getMyConversations = async (req, res) => {
  try {
  const currentUserId = req.user.id;
  
  const conversations =
    await db.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  
  return res.status(200).json({
    conversations
  });
  
  } catch (error) {
  console.error(error);
  
  return res.status(500).json({
    message: "Internal Server Error"
  });
  
  }
  };


// GET CONVERSATION MESSAGES
export const getConversationMessages = async (req, res) => {
  try {
  const { id } = req.params;
  
  const conversation =
    await db.conversation.findUnique({
      where: {
        id: Number(id)
      }
    });
  
  if (!conversation) {
    return res.status(404).json({
      message: "Conversation not found"
    });
  }
  
  const messages =
    await db.message.findMany({
      where: {
        conversationId: Number(id)
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  
  return res.status(200).json({
    messages
  });
  
  } catch (error) {
  console.error(error);
  
  return res.status(500).json({
    message: "Internal Server Error"
  });
  
  }
  };



//SEND MESSAGES
export const sendMessage = async (req, res) => {
  try {
  const currentUserId = req.user.id;
  
  const {
    conversationId,
    content
  } = req.body;
  
  if (!conversationId || !content) {
    return res.status(400).json({
      message:
        "conversationId and content are required"
    });
  }
  
  const conversation =
    await db.conversation.findUnique({
      where: {
        id: Number(conversationId)
      }
    });
  
  if (!conversation) {
    return res.status(404).json({
      message: "Conversation not found"
    });
  }
  
  const message =
    await db.message.create({
      data: {
        conversationId:
          Number(conversationId),
  
        senderId:
          currentUserId,
  
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  
  return res.status(201).json({
    message: "Message sent successfully",
    data: message
  });
  
  } catch (error) {
  console.error(error);
  
  return res.status(500).json({
    message: "Internal Server Error"
  });
  
  }
  };
