src/
│
├── main.ts
├── app.module.ts
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  COMMON — guards, decorators, pipes...
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── common/
│   ├── constants/
│   │   ├── roles.constant.ts           # 'ADMIN'|'STAFF'|'OWNER'|'VENUE_STAFF'|'CUSTOMER'
│   │   ├── events.constant.ts          # 'booking.confirmed'|'payment.success'|...
│   │   ├── booking-status.constant.ts
│   │   ├── payment-status.constant.ts
│   │   ├── venue-status.constant.ts
│   │   ├── notification-type.constant.ts
│   │   ├── notification-channel.constant.ts
│   │   ├── payment-method.constant.ts
│   │   ├── sport-type.constant.ts
│   │   ├── day-of-week.constant.ts
│   │   ├── gender.constant.ts
│   │   ├── kyc-status.constant.ts
│   │   ├── discount-type.constant.ts
│   │   ├── promotion-status.constant.ts
│   │   └── content.constant.ts
│   │
│   ├── decorators/
│   │   ├── roles.decorator.ts          # @Roles('ADMIN', 'STAFF')
│   │   ├── current-user.decorator.ts   # @CurrentUser() → JwtPayload
│   │   ├── public.decorator.ts         # @Public() — bypass JWT guard
│   │   ├── permissions.decorator.ts    # @Permissions('venues:approve')
│   │   ├── api-response.decorator.ts   # @ApiResponse wrapper cho Swagger
│   │   └── response-message.decorator.ts
│   │
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # require login
│   │   ├── optional-jwt-auth.guard.ts  # guest OK, user lấy thêm context
│   │   ├── roles.guard.ts              # kiểm tra platform role
│   │   ├── permissions.guard.ts        # kiểm tra permission slug
│   │   └── ws-jwt.guard.ts             # WebSocket authentication
│   │
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   │
│   ├── interceptors/
│   │   ├── transform.interceptor.ts    # wrap { data, message, statusCode }
│   │   ├── http-logging.interceptor.ts
│   │   └── audit-log.interceptor.ts    # tự động ghi audit_logs
│   │
│   ├── pipes/
│   │   └── trim.pipe.ts
│   │
│   ├── dto/
│   │   └── pagination.dto.ts           # page, limit, sortBy, sortOrder
│   │
│   ├── interfaces/
│   │   └── api-response.interface.ts
│   │
│   ├── types/
│   │   ├── jwt-payload.type.ts
│   │   └── paginated-result.type.ts
│   │
│   ├── services/
│   │   ├── app-logger.service.ts
│   │   └── logger.module.ts
│   │
│   └── utils/
│       ├── response.util.ts
│       └── mask.util.ts                # mask phone/email cho log
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  CONFIG
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── config/
│   ├── index.ts                        # re-export tất cả
│   ├── app.config.ts
│   ├── auth.config.ts                  # JWT secret, expiry
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── storage.config.ts               # Cloudflare R2 / S3
│   ├── cloudflare.config.ts            # Turnstile secret
│   ├── firebase.config.ts              # FCM credentials
│   ├── mail.config.ts                  # Sendgrid / Brevo
│   ├── sms.config.ts                   # ESMS / Twilio
│   ├── logger.config.ts
│   ├── sentry.config.ts
│   └── swagger.config.ts
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  PRISMA
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── prisma/
│   ├── prisma.module.ts                # global module
│   └── prisma.service.ts
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DATABASE — base classes & seeds
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── database/
│   ├── entities/
│   │   └── base.entity.ts
│   ├── repositories/
│   │   └── base.repository.ts
│   └── seeders/
│       ├── seed.ts                     # entry point: npx ts-node seed.ts
│       ├── seeder.module.ts
│       ├── database.seeder.ts
│       ├── roles.seeder.ts             # super_admin|admin|staff|owner|customer
│       ├── permissions.seeder.ts       # tất cả resource:action
│       ├── sport-types.seeder.ts       # Football|Badminton|Tennis|...
│       ├── settings.seeder.ts          # commission_rate|vat_rate|...
│       └── users.seeder.ts             # admin mặc định
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  SHARED — infrastructure services
│  (không phải feature, được inject vào modules)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── shared/
│   │
│   ├── queue/                          # Bull Queue — async jobs
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts            # addJob helper
│   │   └── processors/
│   │       ├── mail.processor.ts       # xử lý job gửi email
│   │       ├── notification.processor.ts # xử lý job push notification
│   │       └── sms.processor.ts        # xử lý job gửi SMS
│   │
│   ├── fcm/                            # Firebase Cloud Messaging
│   │   ├── fcm.module.ts
│   │   └── fcm.service.ts              # sendToDevice, sendToTopic
│   │
│   ├── mail/                           # Email sender
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts             # sendTemplate(to, template, vars)
│   │   └── templates/
│   │       ├── welcome.html
│   │       ├── password_reset.html
│   │       ├── booking_confirmation.html
│   │       ├── booking_cancelled.html
│   │       ├── booking_reminder.html
│   │       ├── payment_success.html
│   │       ├── payout_processed.html
│   │       └── staff_invite.html
│   │
│   ├── sms/                            # SMS sender
│   │   ├── sms.module.ts
│   │   └── sms.service.ts              # send(phone, message)
│   │
│   ├── storage/                        # File upload — R2/S3
│   │   ├── storage.module.ts
│   │   └── storage.service.ts          # upload, delete, getSignedUrl
│   │
│   └── cloudflare/                     # Turnstile bot protection
│       ├── turnstile.module.ts
│       ├── turnstile.service.ts
│       └── turnstile.guard.ts
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  FEATURE MODULES
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
└── modules/
    │
    │━━━━━━━━━━━━━━━━━━
    │  1. AUTH
    │  Tables: refresh_tokens, otp_verifications, user_devices
    │━━━━━━━━━━━━━━━━━━
    │
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.service.ts             # login, register, refresh, logout
    │   ├── otp.service.ts              # genCode, sendOTP, verifyCode
    │   ├── token.service.ts            # issueTokens, revokeToken, rotateRefresh
    │   ├── strategies/
    │   │   └── jwt.strategy.ts
    │   ├── controllers/
    │   │   └── auth.controller.ts      # POST /auth/register
    │   │                               # POST /auth/login
    │   │                               # POST /auth/refresh
    │   │                               # POST /auth/logout
    │   │                               # POST /auth/verify-email
    │   │                               # POST /auth/verify-phone
    │   │                               # POST /auth/forgot-password
    │   │                               # POST /auth/reset-password
    │   │                               # POST /auth/resend-otp
    │   └── dto/
    │       ├── register.dto.ts
    │       ├── login.dto.ts
    │       ├── verify-otp.dto.ts
    │       ├── forgot-password.dto.ts
    │       └── reset-password.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  2. USERS
    │  Tables: users, user_profiles, user_sport_preferences
    │━━━━━━━━━━━━━━━━━━
    │
    ├── users/
    │   ├── users.module.ts
    │   ├── users.service.ts            # findById, updateProfile, changePassword
    │   ├── users-admin.service.ts      # list, ban, suspend, updateKyc, updateRole
    │   ├── controllers/
    │   │   ├── me.controller.ts        # GET    /me
    │   │   │                           # PATCH  /me
    │   │   │                           # PATCH  /me/password
    │   │   │                           # PATCH  /me/notification-settings
    │   │   │                           # GET    /me/sport-preferences
    │   │   │                           # POST   /me/sport-preferences
    │   │   │                           # DELETE /me/sport-preferences/:sport
    │   │   │
    │   │   └── admin.controller.ts     # GET    /admin/users
    │   │                               # GET    /admin/users/:id
    │   │                               # PATCH  /admin/users/:id/status
    │   │                               # PATCH  /admin/users/:id/kyc
    │   │                               # PATCH  /admin/users/:id/role
    │   └── dto/
    │       ├── update-profile.dto.ts
    │       ├── update-password.dto.ts
    │       ├── update-notification-settings.dto.ts
    │       ├── upsert-sport-preference.dto.ts
    │       ├── query-users.dto.ts
    │       └── admin-update-user.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  3. ROLES
    │  Tables: roles, permissions, role_permissions
    │━━━━━━━━━━━━━━━━━━
    │
    ├── roles/
    │   ├── roles.module.ts
    │   ├── roles.service.ts            # findAll, findBySlug, syncPermissions
    │   ├── controllers/
    │   │   └── admin.controller.ts     # GET  /admin/roles
    │   │                               # GET  /admin/roles/:id/permissions
    │   │                               # POST /admin/roles/:id/permissions
    │   │                               # DELETE /admin/roles/:id/permissions/:permId
    │   │                               # GET  /admin/permissions
    │   └── dto/
    │       └── sync-permissions.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  4. VENUES
    │  Tables: venues, sport_assignments, amenities,
    │          venue_operating_hours, venue_schedule_exceptions,
    │          venue_verifications, refund_policies, refund_rules, sport_types
    │━━━━━━━━━━━━━━━━━━
    │
    ├── venues/
    │   ├── venues.module.ts
    │   ├── venues.service.ts           # create, update, delete, checkOwnership
    │   ├── venues-query.service.ts     # search, filter, geo, pagination (public)
    │   ├── venues-admin.service.ts     # approve, reject, suspend, setFeatured
    │   ├── venues-schedule.service.ts  # operatingHours, exceptions
    │   ├── venues-refund.service.ts    # refundPolicies, refundRules
    │   ├── controllers/
    │   │   ├── public.controller.ts    # GET  /venues                (search)
    │   │   │                           # GET  /venues/:slug          (detail)
    │   │   │                           # GET  /venues/:id/courts
    │   │   │                           # GET  /venues/:id/reviews
    │   │   │                           # GET  /venues/:id/operating-hours
    │   │   │                           # GET  /venues/:id/sport-types
    │   │   │                           # GET  /venues/:id/amenities
    │   │   │                           # GET  /venues/:id/refund-policy
    │   │   │
    │   │   ├── owner.controller.ts     # POST   /owner/venues
    │   │   │                           # GET    /owner/venues
    │   │   │                           # GET    /owner/venues/:id
    │   │   │                           # PATCH  /owner/venues/:id
    │   │   │                           # DELETE /owner/venues/:id
    │   │   │                           # PATCH  /owner/venues/:id/operating-hours
    │   │   │                           # POST   /owner/venues/:id/schedule-exceptions
    │   │   │                           # DELETE /owner/venues/:id/schedule-exceptions/:date
    │   │   │                           # POST   /owner/venues/:id/sport-types
    │   │   │                           # DELETE /owner/venues/:id/sport-types/:sport
    │   │   │                           # POST   /owner/venues/:id/amenities
    │   │   │                           # DELETE /owner/venues/:id/amenities/:amenityId
    │   │   │                           # GET|POST|PATCH|DELETE /owner/venues/:id/refund-policies
    │   │   │                           # POST   /owner/venues/:id/verification
    │   │   │
    │   │   └── admin.controller.ts     # GET    /admin/venues
    │   │                               # GET    /admin/venues/:id
    │   │                               # PATCH  /admin/venues/:id/approve
    │   │                               # PATCH  /admin/venues/:id/reject
    │   │                               # PATCH  /admin/venues/:id/suspend
    │   │                               # PATCH  /admin/venues/:id/featured
    │   │                               # PATCH  /admin/venues/:id/commission-rate
    │   │                               # GET    /admin/venues/:id/verification
    │   │                               # PATCH  /admin/venues/:id/verification
    │   └── dto/
    │       ├── create-venue.dto.ts
    │       ├── update-venue.dto.ts
    │       ├── query-venues.dto.ts
    │       ├── operating-hours.dto.ts
    │       ├── schedule-exception.dto.ts
    │       ├── create-refund-policy.dto.ts
    │       ├── create-refund-rule.dto.ts
    │       ├── admin-review-venue.dto.ts
    │       └── admin-commission.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  5. VENUE-STAFF
    │  Tables: venue_staff, venue_staff_invites
    │━━━━━━━━━━━━━━━━━━
    │
    ├── venue-staff/
    │   ├── venue-staff.module.ts
    │   ├── venue-staff.service.ts          # list, updateRole, deactivate
    │   ├── venue-staff-invite.service.ts   # create, accept, reject, revoke, expire
    │   ├── controllers/
    │   │   ├── owner.controller.ts         # GET    /owner/venues/:venueId/staff
    │   │   │                               # POST   /owner/venues/:venueId/staff/invite
    │   │   │                               # PATCH  /owner/venues/:venueId/staff/:staffId/role
    │   │   │                               # DELETE /owner/venues/:venueId/staff/:staffId
    │   │   │                               # GET    /owner/venues/:venueId/invites
    │   │   │                               # DELETE /owner/venues/:venueId/invites/:inviteId
    │   │   │
    │   │   └── staff.controller.ts         # GET  /venue-staff/invites/:token  (xem invite)
    │   │                                   # POST /venue-staff/invites/:token/accept
    │   │                                   # POST /venue-staff/invites/:token/reject
    │   │                                   # GET  /me/staff-venues  (venue tôi làm việc)
    │   └── dto/
    │       ├── invite-staff.dto.ts
    │       └── update-staff-role.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  6. COURTS
    │  Tables: courts, pricing_rules, court_maintenance
    │━━━━━━━━━━━━━━━━━━
    │
    ├── courts/
    │   ├── courts.module.ts
    │   ├── courts.service.ts           # CRUD, checkAvailability, assertOwnership
    │   ├── pricing.service.ts          # calcPrice, getApplicableRule, holiday multiplier
    │   ├── maintenance.service.ts      # block, unblock, listSlots
    │   ├── controllers/
    │   │   ├── public.controller.ts    # GET /courts/:id
    │   │   │                           # GET /courts/:id/available-slots?date=
    │   │   │                           # GET /courts/:id/pricing?date=&start=&end=
    │   │   │
    │   │   └── owner.controller.ts     # GET    /owner/venues/:venueId/courts
    │   │                               # POST   /owner/venues/:venueId/courts
    │   │                               # GET    /owner/courts/:id
    │   │                               # PATCH  /owner/courts/:id
    │   │                               # DELETE /owner/courts/:id
    │   │                               # GET    /owner/courts/:id/pricing-rules
    │   │                               # POST   /owner/courts/:id/pricing-rules
    │   │                               # PATCH  /owner/courts/:id/pricing-rules/:ruleId
    │   │                               # DELETE /owner/courts/:id/pricing-rules/:ruleId
    │   │                               # GET    /owner/courts/:id/maintenance
    │   │                               # POST   /owner/courts/:id/maintenance
    │   │                               # DELETE /owner/courts/:id/maintenance/:id
    │   └── dto/
    │       ├── create-court.dto.ts
    │       ├── update-court.dto.ts
    │       ├── create-pricing-rule.dto.ts
    │       ├── update-pricing-rule.dto.ts
    │       ├── create-maintenance.dto.ts
    │       └── available-slots-query.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  7. BOOKINGS
    │  Tables: bookings, booking_addons, booking_status_history,
    │          booking_waitlist, recurring_bookings,
    │          recurring_booking_days, venue_services
    │━━━━━━━━━━━━━━━━━━
    │
    ├── bookings/
    │   ├── bookings.module.ts
    │   ├── bookings.service.ts         # create (with Prisma tx), cancel, reschedule, calcTotal
    │   ├── bookings-query.service.ts   # list, detail, stats — filter theo role
    │   ├── checkin.service.ts          # verifyCode, checkIn, markNoShow
    │   ├── waitlist.service.ts         # join, leave, notifyNext, convertToBooking
    │   ├── recurring.service.ts        # createPattern, generateInstances (cron)
    │   ├── venue-services.service.ts   # CRUD venue_services, inventory track
    │   ├── controllers/
    │   │   ├── customer.controller.ts      # POST   /bookings
    │   │   │                               # GET    /bookings/:id
    │   │   │                               # POST   /bookings/:id/cancel
    │   │   │                               # POST   /bookings/:id/reschedule
    │   │   │                               # POST   /bookings/:id/addons
    │   │   │                               # GET    /me/bookings
    │   │   │                               # POST   /waitlist
    │   │   │                               # DELETE /waitlist/:id
    │   │   │                               # GET    /me/waitlist
    │   │   │                               # POST   /recurring-bookings
    │   │   │                               # GET    /me/recurring-bookings
    │   │   │                               # PATCH  /recurring-bookings/:id
    │   │   │                               # DELETE /recurring-bookings/:id
    │   │   │
    │   │   ├── venue-staff.controller.ts   # GET  /venue-staff/bookings?venueId=&date=
    │   │   │                               # GET  /venue-staff/bookings/:id
    │   │   │                               # POST /venue-staff/checkin
    │   │   │                               # PATCH /venue-staff/bookings/:id/status
    │   │   │                               # POST /venue-staff/bookings/:id/addons
    │   │   │
    │   │   ├── owner.controller.ts         # GET  /owner/venues/:venueId/bookings
    │   │   │                               # GET  /owner/venues/:venueId/bookings/stats
    │   │   │                               # GET  /owner/venues/:venueId/services
    │   │   │                               # POST /owner/venues/:venueId/services
    │   │   │                               # PATCH|DELETE /owner/services/:id
    │   │   │
    │   │   └── admin.controller.ts         # GET   /admin/bookings
    │   │                                   # GET   /admin/bookings/:id
    │   │                                   # PATCH /admin/bookings/:id/status
    │   └── dto/
    │       ├── create-booking.dto.ts
    │       ├── cancel-booking.dto.ts
    │       ├── reschedule-booking.dto.ts
    │       ├── add-addon.dto.ts
    │       ├── checkin.dto.ts
    │       ├── create-waitlist.dto.ts
    │       ├── create-recurring.dto.ts
    │       ├── update-recurring.dto.ts
    │       ├── create-venue-service.dto.ts
    │       └── query-bookings.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  8. PAYMENTS
    │  Tables: payments, wallets, payout_bank_accounts,
    │          transactions, invoices, invoice_items,
    │          payout_requests, commission_records
    │━━━━━━━━━━━━━━━━━━
    │
    ├── payments/
    │   ├── payments.module.ts
    │   ├── payments.service.ts         # initPayment, handleCallback, refund
    │   ├── wallet.service.ts           # getBalance, deposit, deduct (optimistic lock via version)
    │   ├── transaction.service.ts      # createTx, getHistory, getBalance
    │   ├── invoice.service.ts          # generate, getPdf, void
    │   ├── payout.service.ts           # request, process, reject, cancel
    │   ├── commission.service.ts       # calc, markPaid, getStats
    │   ├── gateways/
    │   │   ├── payment-gateway.interface.ts  # IPaymentGateway contract
    │   │   ├── vnpay.gateway.ts
    │   │   ├── momo.gateway.ts
    │   │   └── zalopay.gateway.ts
    │   ├── controllers/
    │   │   ├── customer.controller.ts  # POST   /payments/init
    │   │   │                           # GET    /payments/:id/status
    │   │   │                           # GET    /me/wallet
    │   │   │                           # GET    /me/transactions
    │   │   │                           # GET    /me/invoices
    │   │   │                           # GET    /me/invoices/:id/pdf
    │   │   │                           # POST   /me/wallet/bank-accounts
    │   │   │                           # GET    /me/wallet/bank-accounts
    │   │   │                           # PATCH  /me/wallet/bank-accounts/:id/default
    │   │   │                           # DELETE /me/wallet/bank-accounts/:id
    │   │   │
    │   │   ├── owner.controller.ts     # GET  /owner/payouts
    │   │   │                           # POST /owner/payouts
    │   │   │                           # DELETE /owner/payouts/:id   (cancel pending)
    │   │   │                           # GET  /owner/commissions
    │   │   │                           # GET  /owner/revenues/stats
    │   │   │
    │   │   ├── webhook.controller.ts   # POST /webhooks/vnpay
    │   │   │                           # POST /webhooks/momo
    │   │   │                           # POST /webhooks/zalopay
    │   │   │
    │   │   └── admin.controller.ts     # GET   /admin/payouts
    │   │                               # PATCH /admin/payouts/:id/approve
    │   │                               # PATCH /admin/payouts/:id/reject
    │   │                               # GET   /admin/commissions
    │   │                               # GET   /admin/revenues/stats
    │   └── dto/
    │       ├── init-payment.dto.ts
    │       ├── add-bank-account.dto.ts
    │       ├── request-payout.dto.ts
    │       ├── process-payout.dto.ts
    │       ├── query-transactions.dto.ts
    │       └── query-commissions.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  9. REVIEWS
    │  Tables: reviews
    │━━━━━━━━━━━━━━━━━━
    │
    ├── reviews/
    │   ├── reviews.module.ts
    │   ├── reviews.service.ts          # create, update, delete, respond, hide
    │   │                               # updateVenueRatingDenorm (trigger sau write)
    │   ├── controllers/
    │   │   ├── customer.controller.ts  # POST   /reviews
    │   │   │                           # PATCH  /reviews/:id
    │   │   │                           # DELETE /reviews/:id
    │   │   │
    │   │   ├── owner.controller.ts     # POST  /reviews/:id/response
    │   │   │                           # PATCH /reviews/:id/response
    │   │   │
    │   │   └── admin.controller.ts     # GET   /admin/reviews
    │   │                               # PATCH /admin/reviews/:id/hide
    │   │                               # PATCH /admin/reviews/:id/show
    │   └── dto/
    │       ├── create-review.dto.ts
    │       ├── update-review.dto.ts
    │       └── respond-review.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  10. PROMOTIONS
    │  Tables: promotions, promotion_venues, promotion_usage, user_vouchers
    │━━━━━━━━━━━━━━━━━━
    │
    ├── promotions/
    │   ├── promotions.module.ts
    │   ├── promotions.service.ts       # validateCode, applyToBooking, calcDiscount
    │   ├── voucher.service.ts          # issue, listByUser, expire
    │   ├── controllers/
    │   │   ├── public.controller.ts    # GET  /promotions              (is_public=true)
    │   │   │                           # POST /promotions/validate      (check code)
    │   │   │                           # GET  /me/vouchers
    │   │   │
    │   │   └── admin.controller.ts     # GET    /admin/promotions
    │   │                               # POST   /admin/promotions
    │   │                               # PATCH  /admin/promotions/:id
    │   │                               # DELETE /admin/promotions/:id
    │   │                               # POST   /admin/promotions/:id/venues
    │   │                               # DELETE /admin/promotions/:id/venues/:venueId
    │   │                               # POST   /admin/promotions/:id/issue-voucher
    │   │                               # GET    /admin/promotions/:id/stats
    │   └── dto/
    │       ├── create-promotion.dto.ts
    │       ├── update-promotion.dto.ts
    │       ├── validate-code.dto.ts
    │       └── issue-voucher.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  11. NOTIFICATIONS
    │  Tables: notifications, user_devices
    │  NOTE: push → shared/fcm | email → shared/mail | sms → shared/sms
    │        notifications module chỉ điều phối, KHÔNG duplicate logic gửi
    │━━━━━━━━━━━━━━━━━━
    │
    ├── notifications/
    │   ├── notifications.module.ts
    │   ├── notifications.service.ts    # createInApp, markRead, markAllRead, list
    │   ├── listeners/                  # EventEmitter2 — tránh circular dependency
    │   │   ├── booking.listener.ts     # on('booking.confirmed')  → inApp + queue(email+push)
    │   │   │                           # on('booking.cancelled')  → inApp + queue(email+push)
    │   │   │                           # on('booking.reminder')   → queue(push) via cron
    │   │   │                           # on('booking.checkin')    → inApp
    │   │   ├── payment.listener.ts     # on('payment.success')    → inApp + queue(email)
    │   │   │                           # on('payment.failed')     → inApp + queue(push)
    │   │   ├── review.listener.ts      # on('review.created')     → inApp (owner)
    │   │   ├── payout.listener.ts      # on('payout.processed')   → inApp + queue(email)
    │   │   └── staff.listener.ts       # on('staff.invited')      → queue(email)
    │   ├── controllers/
    │   │   └── customer.controller.ts  # GET    /me/notifications
    │   │                               # PATCH  /me/notifications/:id/read
    │   │                               # PATCH  /me/notifications/read-all
    │   │                               # POST   /me/devices
    │   │                               # DELETE /me/devices/:fcmToken
    │   └── dto/
    │       ├── register-device.dto.ts
    │       └── query-notifications.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  12. SUPPORT
    │  Tables: support_tickets, support_ticket_messages, reports
    │━━━━━━━━━━━━━━━━━━
    │
    ├── support/
    │   ├── support.module.ts
    │   ├── tickets.service.ts          # create, assign, addMessage, resolve, close, reopen
    │   ├── reports.service.ts          # submit, review, dismiss, resolve
    │   ├── controllers/
    │   │   ├── customer.controller.ts  # POST /support/tickets
    │   │   │                           # GET  /me/support-tickets
    │   │   │                           # GET  /support/tickets/:id
    │   │   │                           # POST /support/tickets/:id/messages
    │   │   │                           # POST /support/tickets/:id/reopen
    │   │   │                           # POST /support/tickets/:id/rate
    │   │   │                           # POST /reports
    │   │   │
    │   │   └── admin.controller.ts     # GET   /admin/support/tickets
    │   │                               # GET   /admin/support/tickets/:id
    │   │                               # PATCH /admin/support/tickets/:id/assign
    │   │                               # PATCH /admin/support/tickets/:id/resolve
    │   │                               # PATCH /admin/support/tickets/:id/close
    │   │                               # POST  /admin/support/tickets/:id/messages
    │   │                               # GET   /admin/reports
    │   │                               # GET   /admin/reports/:id
    │   │                               # PATCH /admin/reports/:id/review
    │   │                               # PATCH /admin/reports/:id/dismiss
    │   └── dto/
    │       ├── create-ticket.dto.ts
    │       ├── send-message.dto.ts
    │       ├── rate-ticket.dto.ts
    │       ├── create-report.dto.ts
    │       ├── query-tickets.dto.ts
    │       └── review-report.dto.ts
    │
    │━━━━━━━━━━━━━━━━━━
    │  13. SYSTEM
    │  Tables: audit_logs, settings, holiday_calendar, search_history,
    │          app_versions, contents, banners, banner_pages,
    │          files, media_attachments, favorite_venues
    │━━━━━━━━━━━━━━━━━━
    │
    └── system/
        ├── system.module.ts            # imports tất cả sub-modules, exports FilesModule
        │
        ├── files/                      # Upload & media management
        │   ├── files.module.ts
        │   ├── files.service.ts        # upload → storage.service, saveRecord, delete
        │   ├── media.service.ts        # attachToEntity, reorder, setCover, detach
        │   └── controllers/
        │       └── files.controller.ts # POST   /files/upload
        │                               # DELETE /files/:id
        │                               # POST   /files/:id/attach
        │                               # PATCH  /files/attachments/:id/reorder
        │
        ├── content/                    # CMS: Banner, FAQ, Policy, Promotion Page
        │   ├── content.module.ts
        │   ├── content.service.ts      # CRUD, publish, schedule, expire
        │   ├── banner.service.ts       # CRUD banners, trackImpression, trackClick
        │   └── controllers/
        │       ├── public.controller.ts  # GET /banners?page=HOME
        │       │                         # GET /faq?category=
        │       │                         # GET /policies/:type
        │       │                         # POST /banners/:id/impression  (track)
        │       │                         # POST /banners/:id/click       (track)
        │       │
        │       └── admin.controller.ts   # CRUD /admin/contents
        │                                 # PATCH /admin/contents/:id/publish
        │                                 # PATCH /admin/contents/:id/archive
        │                                 # CRUD /admin/banners
        │                                 # POST  /admin/banners/:id/pages
        │                                 # DELETE /admin/banners/:id/pages/:page
        │
        ├── settings/                   # Key-value system settings
        │   ├── settings.module.ts
        │   ├── settings.service.ts     # get(key), set(key,val), getGroup(group)
        │   └── controllers/
        │       └── admin.controller.ts # GET   /admin/settings
        │                               # GET   /admin/settings/:group
        │                               # PATCH /admin/settings/:key
        │
        ├── holidays/                   # Holiday calendar — price multiplier
        │   ├── holidays.module.ts
        │   ├── holidays.service.ts     # isHoliday, getMultiplier, listByYear
        │   └── controllers/
        │       └── admin.controller.ts # GET    /admin/holidays
        │                               # POST   /admin/holidays
        │                               # PATCH  /admin/holidays/:id
        │                               # DELETE /admin/holidays/:id
        │
        ├── audit/                      # Audit logs — read only cho admin
        │   ├── audit.module.ts
        │   ├── audit.service.ts        # log(action, entity, old, new), query
        │   └── controllers/
        │       └── admin.controller.ts # GET /admin/audit-logs
        │                               # GET /admin/audit-logs/:entityName/:entityId
        │
        ├── app-versions/               # Mobile force update
        │   ├── app-versions.module.ts
        │   ├── app-versions.service.ts # checkUpdate, isForceUpdate, getLatest
        │   └── controllers/
        │       ├── public.controller.ts  # GET /app-versions/check?platform=&version=
        │       └── admin.controller.ts   # GET    /admin/app-versions
        │                                 # POST   /admin/app-versions
        │                                 # PATCH  /admin/app-versions/:id
        │                                 # DELETE /admin/app-versions/:id
        │
        └── favorites/                  # Venue favorites
            ├── favorites.module.ts
            ├── favorites.service.ts    # add, remove, list, isLiked
            └── controllers/
                └── favorites.controller.ts # POST   /me/favorites/:venueId
                                            # DELETE /me/favorites/:venueId
                                            # GET    /me/favorites