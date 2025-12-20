import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Notification, NotificationType, SentVia } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { User } from '../users/entities/user.entity';
import * as admin from 'firebase-admin';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
        this.logger.log('Firebase Admin initialized successfully');
      } catch (error) {
        this.logger.warn('Firebase Admin initialization failed:', error.message);
      }
    }
  }

  // =====================================================
  // CREATE - Tạo thông báo mới
  // =====================================================
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const notification = this.notificationRepository.create(dto);
    const savedNotification = await this.notificationRepository.save(notification);

    // Gửi notification dựa trên sentVia
    if (dto.sentVia === SentVia.PUSH && user.fcmToken) {
      await this.notificationQueue.add('send-push', {
        userId: dto.userId,
        fcmToken: user.fcmToken,
        notification: savedNotification,
      });
    }

    return savedNotification;
  }

  // =====================================================
  // CREATE - Gửi thông báo hàng loạt
  // =====================================================
  async sendBulkNotification(dto: CreateNotificationDto): Promise<Notification[]> {
    if (!dto.recipientIds || dto.recipientIds.length === 0) {
      throw new BadRequestException('recipientIds must not be empty');
    }

    const notifications: Notification[] = [];

    for (const userId of dto.recipientIds) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        const notification = this.notificationRepository.create({
          ...dto,
          userId,
        });

        const saved = await this.notificationRepository.save(notification);
        notifications.push(saved);

        // Queue push notification
        if (dto.sentVia === SentVia.PUSH && user.fcmToken) {
          await this.notificationQueue.add('send-push', {
            userId,
            fcmToken: user.fcmToken,
            notification: saved,
          });
        }
      }
    }

    return notifications;
  }

  // =====================================================
  // READ - Lấy tất cả thông báo
  // =====================================================
  async findAll(filters?: NotificationFilterDto): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.createdAt', 'DESC');

    if (filters?.notificationType) {
      query.andWhere('notification.notificationType = :type', {
        type: filters.notificationType,
      });
    }

    if (filters?.isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
    }

    if (filters?.unreadOnly) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy thông báo theo ID
  // =====================================================
  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  // =====================================================
  // READ - Lấy thông báo của user
  // =====================================================
  async getUserNotifications(
    userId: string,
    filters?: NotificationFilterDto,
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(50);

    if (filters?.notificationType) {
      query.andWhere('notification.notificationType = :type', {
        type: filters.notificationType,
      });
    }

    if (filters?.unreadOnly || filters?.isRead === false) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy thông báo chưa đọc của user
  // =====================================================
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        isRead: false,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // READ - Đếm thông báo chưa đọc
  // =====================================================
  async countUnreadNotifications(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // =====================================================
  // READ - Lấy thông báo theo loại
  // =====================================================
  async findByType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        notificationType: type,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // UPDATE - Cập nhật thông báo
  // =====================================================
  async update(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, dto);
    return this.notificationRepository.save(notification);
  }

  // =====================================================
  // UPDATE - Đánh dấu là đã đọc
  // =====================================================
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  // =====================================================
  // UPDATE - Đánh dấu nhiều thông báo là đã đọc
  // =====================================================
  async markMultipleAsRead(ids: string[]): Promise<void> {
    await this.notificationRepository.update(
      { id: In(ids) },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  // =====================================================
  // UPDATE - Đánh dấu tất cả thông báo của user là đã đọc
  // =====================================================
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  // =====================================================
  // DELETE - Xóa thông báo
  // =====================================================
  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  // =====================================================
  // DELETE - Xóa thông báo của user
  // =====================================================
  async removeByUser(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      userId,
    });
  }

  // =====================================================
  // DELETE - Xóa thông báo cũ
  // =====================================================
  async removeOldNotifications(daysOld: number = 30): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    await this.notificationRepository.delete({
      createdAt: IsNull() ? undefined : undefined,
    });

    this.logger.log(`Deleted notifications older than ${daysOld} days`);
  }

  // =====================================================
  // PUSH NOTIFICATION - Gửi push notification
  // =====================================================
  async sendPushNotification(
    userId: string,
    fcmToken: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<string> {
    try {
      if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      const message = {
        notification: { title, body },
        data: data || {},
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);

      // Lưu vào database
      await this.notificationRepository.save({
        userId,
        title,
        content: body,
        notificationType: data?.type || NotificationType.SYSTEM,
        relatedId: data?.relatedId,
        relatedType: data?.relatedType,
        sentVia: SentVia.PUSH,
      });

      this.logger.log(`Push notification sent successfully: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo đặt sân
  // =====================================================
  async sendBookingNotification(
    userId: string,
    fcmToken: string,
    bookingData: any,
  ): Promise<Notification> {
    return this.notificationRepository.save({
      userId,
      title: 'Đặt sân thành công',
      content: `Bạn đã đặt sân ${bookingData.courtName} vào ${bookingData.bookingDate}`,
      notificationType: NotificationType.BOOKING,
      relatedId: bookingData.id,
      relatedType: 'booking',
      sentVia: SentVia.PUSH,
    });
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo thanh toán
  // =====================================================
  async sendPaymentNotification(
    userId: string,
    paymentData: any,
  ): Promise<Notification> {
    return this.notificationRepository.save({
      userId,
      title: 'Thanh toán thành công',
      content: `Thanh toán ${paymentData.amount} VNĐ cho đặt sân đã được xác nhận`,
      notificationType: NotificationType.PAYMENT,
      relatedId: paymentData.id,
      relatedType: 'payment',
      sentVia: SentVia.IN_APP,
    });
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo review
  // =====================================================
  async sendReviewNotification(
    userId: string,
    reviewData: any,
  ): Promise<Notification> {
    return this.notificationRepository.save({
      userId,
      title: 'Có đánh giá mới',
      content: `Bạn có một đánh giá mới từ ${reviewData.userName}`,
      notificationType: NotificationType.REVIEW,
      relatedId: reviewData.id,
      relatedType: 'review',
      sentVia: SentVia.IN_APP,
    });
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo khuyến mãi
  // =====================================================
  async sendPromotionNotification(
    userIds: string[],
    promotionData: any,
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        title: promotionData.title,
        content: promotionData.description,
        notificationType: NotificationType.PROMOTION,
        relatedId: promotionData.id,
        relatedType: 'promotion',
        sentVia: SentVia.PUSH,
      })
    );

    return this.notificationRepository.save(notifications);
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo hệ thống
  // =====================================================
  async sendSystemNotification(
    userId: string,
    title: string,
    content: string,
  ): Promise<Notification> {
    return this.notificationRepository.save({
      userId,
      title,
      content,
      notificationType: NotificationType.SYSTEM,
      sentVia: SentVia.IN_APP,
    });
  }

  // =====================================================
  // NOTIFICATIONS - Gửi thông báo hệ thống cho tất cả users
  // =====================================================
  async sendSystemNotificationToAll(
    title: string,
    content: string,
  ): Promise<Notification[]> {
    const users = await this.userRepository.find();
    const notifications = users.map((user) =>
      this.notificationRepository.create({
        userId: user.id,
        title,
        content,
        notificationType: NotificationType.SYSTEM,
        sentVia: SentVia.IN_APP,
      })
    );

    return this.notificationRepository.save(notifications);
  }

  // =====================================================
  // STATISTICS - Thống kê thông báo
  // =====================================================
  async getNotificationStatistics(userId: string): Promise<any> {
    const total = await this.notificationRepository.count({
      where: { userId },
    });

    const unread = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.notificationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.notificationType')
      .getRawMany();

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}