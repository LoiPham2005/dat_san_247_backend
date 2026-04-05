import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationType, NotificationChannel, NotificationReferenceType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: NotificationReferenceType;
  }) {
    try {
      const notification = await this.prisma.notifications.create({
        data: {
          user_id: data.userId,
          type: data.type,
          channel: data.channel,
          title: data.title,
          message: data.message,
          reference_id: data.referenceId,
          reference_type: data.referenceType,
        },
      });

      // Bắn Realtime qua Socket.io nếu channel là IN_APP hoặc PUSH
      if (data.channel === NotificationChannel.IN_APP || data.channel === NotificationChannel.PUSH) {
        this.gateway.sendNotificationToUser(data.userId, notification);
      }

      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsRead(id: string) {
    return this.prisma.notifications.update({
      where: { id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  async getNotifications(userId: string, limit = 20, offset = 0) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });
  }

  // --- Administrative Methods ---

  async getAdminNotifications(params: {
    page?: number;
    limit?: number;
    userId?: string;
    type?: NotificationType;
    isRead?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 10, userId, type, isRead, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId && userId !== '') where.user_id = userId;
    if (type) where.type = type;
    if (isRead !== undefined && typeof isRead === 'boolean') where.is_read = isRead;
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rawItems, totalCount] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        // Sử dụng distinct trên reference_id nếu là tin broadcast, hoặc dùng tổ hợp các trường
        distinct: ['title', 'message', 'created_at'], 
        take: limit,
        skip,
        include: {
          users: {
            select: {
              full_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      // Tính toán total dựa trên số lượng nhóm duy nhất
      this.prisma.notifications.groupBy({
        by: ['title', 'message', 'created_at'],
        where,
        _count: true,
      }).then(res => res.length)
    ]);

    return {
      items: rawItems,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async sendToAll(data: {
    title: string;
    message: string;
    type?: NotificationType;
  }) {
    // Để tối ưu, nếu hệ thống lớn nên dùng Worker/Job. 
    // Hiện tại em fetch list user id ra để bulk create cho đơn giản với bác nhé.
    const users = await this.prisma.users.findMany({
      where: { status: 'ACTIVE', deleted_at: null },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map(user => 
        this.create({
          userId: user.id,
          title: data.title,
          message: data.message,
          type: data.type || NotificationType.SYSTEM,
          channel: NotificationChannel.IN_APP,
        })
      )
    );

    return { count: notifications.length };
  }

  async sendToRoles(roles: string[], data: {
    title: string;
    message: string;
    type?: NotificationType;
  }) {
    const users = await this.prisma.users.findMany({
      where: { 
        role: { slug: { in: roles } },
        status: 'ACTIVE', 
        deleted_at: null 
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map(user => 
        this.create({
          userId: user.id,
          title: data.title,
          message: data.message,
          type: data.type || NotificationType.SYSTEM,
          channel: NotificationChannel.IN_APP,
        })
      )
    );

    return { count: notifications.length };
  }

  async delete(id: string) {
    return this.prisma.notifications.delete({
      where: { id },
    });
  }
}
