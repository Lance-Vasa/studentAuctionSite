import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const message = this.messagesRepository.create({
      sender_id: senderId,
      receiver_id: createMessageDto.receiver_id || null,
      content: createMessageDto.content,
    });
    return this.messagesRepository.save(message);
  }

  async getPublicMessages() {
    return this.messagesRepository.find({
      where: { receiver_id: IsNull() },
      relations: ['sender'],
      order: { created_at: 'ASC' },
      take: 50, // Limit to last 50 messages
    });
  }

  async getConversations(userId: string) {
    // Get all messages where user is sender or receiver
    const sentMessages = await this.messagesRepository.find({
      where: { sender_id: userId },
      relations: ['receiver'],
      order: { created_at: 'DESC' },
    });

    const receivedMessages = await this.messagesRepository.find({
      where: { receiver_id: userId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
    });

    const conversationMap = new Map<string, any>();

    // Process sent messages
    sentMessages.forEach(msg => {
      if (!msg.receiver_id || !msg.receiver) {
        return;
      }

      if (!conversationMap.has(msg.receiver_id)) {
        conversationMap.set(msg.receiver_id, {
          user: msg.receiver,
          lastMessage: msg,
        });
      }
    });

    // Process received messages
    receivedMessages.forEach(msg => {
      if (!conversationMap.has(msg.sender_id)) {
        conversationMap.set(msg.sender_id, {
          user: msg.sender,
          lastMessage: msg,
        });
      } else {
        // Update if this message is newer
        const existing = conversationMap.get(msg.sender_id);
        if (msg.created_at > existing.lastMessage.created_at) {
          conversationMap.set(msg.sender_id, {
            user: msg.sender,
            lastMessage: msg,
          });
        }
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => 
      b.lastMessage.created_at.getTime() - a.lastMessage.created_at.getTime()
    );
  }

  async getMessages(userId: string, otherUserId: string) {
    return this.messagesRepository.find({
      where: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });
  }
}
