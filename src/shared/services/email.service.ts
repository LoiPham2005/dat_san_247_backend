// =====================================================
// 8. SHARED SERVICE - Email
// =====================================================

// shared/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendBookingConfirmation(to: string, bookingData: any) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject: `Xác nhận đặt sân - ${bookingData.bookingCode}`,
        html: this.getBookingConfirmationTemplate(bookingData),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Booking confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendBookingCancellation(to: string, bookingData: any) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject: `Hủy đặt sân - ${bookingData.bookingCode}`,
        html: this.getCancellationTemplate(bookingData),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Cancellation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
    }
  }

  private getBookingConfirmationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-info { margin: 20px 0; }
          .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Xác nhận đặt sân thành công</h1>
          </div>
          <div class="content">
            <p>Xin chào ${data.customerName},</p>
            <p>Đặt sân của bạn đã được xác nhận thành công!</p>
            
            <div class="booking-info">
              <div class="info-row"><strong>Mã đặt sân:</strong> ${data.bookingCode}</div>
              <div class="info-row"><strong>Sân:</strong> ${data.courtName}</div>
              <div class="info-row"><strong>Ngày chơi:</strong> ${data.bookingDate}</div>
              <div class="info-row"><strong>Giờ:</strong> ${data.startTime} - ${data.endTime}</div>
              <div class="info-row"><strong>Tổng tiền:</strong> ${data.finalPrice.toLocaleString('vi-VN')} VNĐ</div>
            </div>

            <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCancellationTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Đặt sân đã bị hủy</h1>
          </div>
          <div class="content">
            <p>Xin chào ${data.customerName},</p>
            <p>Đặt sân ${data.bookingCode} của bạn đã bị hủy.</p>
            <p><strong>Lý do:</strong> ${data.cancellationReason}</p>
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}