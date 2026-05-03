import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.userId, createMessageDto);
  }

  @Get('public')
  getPublicMessages() {
    return this.messagesService.getPublicMessages();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  getMessages(@Request() req: any, @Param('userId') otherUserId: string) {
    return this.messagesService.getMessages(req.user.userId, otherUserId);
  }
}
