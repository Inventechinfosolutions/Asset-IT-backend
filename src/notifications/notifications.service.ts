import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';

type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  requestId: number;
  senderId: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findMine(userId: string, receiverId = userId) {
    if (receiverId !== userId) {
      throw new ForbiddenException('You can only view your own notifications');
    }

    const [data, unreadCount] = await Promise.all([
      this.notificationsRepository.find({
        where: { receiverId },
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.notificationsRepository.count({
        where: { receiverId, isRead: false },
      }),
    ]);

    return { data, unreadCount };
  }

  async markRead(userId: string, id: number) {
    await this.notificationsRepository.update(
      { id, receiverId: userId },
      { isRead: true },
    );

    return this.findMine(userId);
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.delete({ receiverId: userId });

    return this.findMine(userId);
  }

  async clearRequestCreatedNotification(requestId: number): Promise<void> {
    await this.notificationsRepository.delete({
      requestId,
      type: NotificationType.REQUEST_CREATED,
    });
  }

  async notifyRequestCreated(
    requestId: number,
    requestTitle: string,
    senderId: string,
  ): Promise<void> {
    const admins = await this.usersRepository.find({
      where: { role: UserRole.ADMIN, isActive: true },
    });

    await this.createForUsers(
      admins.map((admin) => admin.id),
      {
        type: NotificationType.REQUEST_CREATED,
        title: 'New request submitted',
        message: `A new request "${requestTitle}" is waiting for review.`,
        requestId,
        senderId,
      },
    );
  }

  async notifyRequestStatusChanged(
    requestId: number,
    requestTitle: string,
    status: string,
    requesterId: string,
    senderId: string,
  ): Promise<void> {
    await this.createForUsers([requesterId], {
      type: NotificationType.REQUEST_STATUS_CHANGED,
      title: 'Request status updated',
      message: `Request "${requestTitle}" is now ${status.replaceAll('_', ' ')}.`,
      requestId,
      senderId,
    });
  }

  private async createForUsers(
    userIds: string[],
    payload: NotificationPayload,
  ): Promise<void> {
    if (userIds.length === 0) return;

    const notifications = userIds.map((userId) =>
      this.notificationsRepository.create({
        receiverId: userId,
        ...payload,
        isRead: false,
      }),
    );

    await this.notificationsRepository.save(notifications);
  }
}
