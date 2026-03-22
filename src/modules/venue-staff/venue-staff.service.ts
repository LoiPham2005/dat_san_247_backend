import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VenueStaffRole, VenueStaffInviteStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class VenueStaffService {
    constructor(private prisma: PrismaService) { }

    private async validateVenueOwner(venueId: string, ownerId: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: venueId, owner_id: ownerId }
        });
        if (!venue) throw new ForbiddenException('Bạn không có quyền quản lý cơ sở này');
        return venue;
    }

    async getStaffByVenue(venueId: string, ownerId: string) {
        await this.validateVenueOwner(venueId, ownerId);

        const staff = await this.prisma.venue_staff.findMany({
            where: { venue_id: venueId },
            include: {
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return staff.map(s => ({
            id: s.id,
            user_id: s.user_id,
            full_name: s.users.full_name,
            email: s.users.email,
            avatar_url: s.users.avatar_url,
            role: s.role,
            is_active: s.is_active,
            joined_at: s.joined_at,
            venue_id: s.venue_id
        }));
    }

    async updateStaffRole(staffId: string, role: VenueStaffRole, ownerId: string) {
        const staff = await this.prisma.venue_staff.findUnique({
            where: { id: staffId },
            include: { venues: true }
        });

        if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');
        if (staff.venues.owner_id !== ownerId) throw new ForbiddenException('Bạn không có quyền');

        return await this.prisma.venue_staff.update({
            where: { id: staffId },
            data: { role }
        });
    }

    async toggleStaffStatus(staffId: string, is_active: boolean, ownerId: string) {
        const staff = await this.prisma.venue_staff.findUnique({
            where: { id: staffId },
            include: { venues: true }
        });

        if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');
        if (staff.venues.owner_id !== ownerId) throw new ForbiddenException('Bạn không có quyền');

        return await this.prisma.venue_staff.update({
            where: { id: staffId },
            data: { 
                is_active,
                deactivated_at: is_active ? null : new Date(),
                deactivated_by: is_active ? null : ownerId
            }
        });
    }

    async inviteStaff(data: { venue_id: string, email: string, role: VenueStaffRole }, ownerId: string) {
        await this.validateVenueOwner(data.venue_id, ownerId);

        // Check if already staff
        const existingStaff = await this.prisma.venue_staff.findFirst({
            where: {
                venue_id: data.venue_id,
                users: { email: data.email }
            }
        });
        if (existingStaff) throw new BadRequestException('Người dùng này đã là nhân viên của cơ sở');

        // Check active invites
        const existingInvite = await this.prisma.venue_staff_invites.findFirst({
            where: {
                venue_id: data.venue_id,
                invite_email: data.email,
                status: VenueStaffInviteStatus.PENDING,
                expires_at: { gt: new Date() }
            }
        });
        if (existingInvite) throw new BadRequestException('Đã có lời mời đang chờ xử lý cho email này');

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        return await this.prisma.venue_staff_invites.create({
            data: {
                venue_id: data.venue_id,
                sender_id: ownerId,
                invite_email: data.email,
                role: data.role,
                token,
                expires_at: expiresAt,
                status: VenueStaffInviteStatus.PENDING
            }
        });
    }

    async getInvitesByVenue(venueId: string, ownerId: string) {
        await this.validateVenueOwner(venueId, ownerId);

        return await this.prisma.venue_staff_invites.findMany({
            where: { venue_id: venueId },
            orderBy: { created_at: 'desc' }
        });
    }

    async revokeInvite(inviteId: string, ownerId: string) {
        const invite = await this.prisma.venue_staff_invites.findUnique({
            where: { id: inviteId },
            include: { venues: true }
        });

        if (!invite) throw new NotFoundException('Không tìm thấy lời mời');
        if (invite.venues.owner_id !== ownerId) throw new ForbiddenException('Bạn không có quyền');
        if (invite.status !== VenueStaffInviteStatus.PENDING) throw new BadRequestException('Chỉ có thể thu hồi lời mời đang chờ');

        return await this.prisma.venue_staff_invites.update({
            where: { id: inviteId },
            data: { status: VenueStaffInviteStatus.REVOKED }
        });
    }

    async getInviteByToken(token: string) {
        const invite = await this.prisma.venue_staff_invites.findUnique({
            where: { token },
            include: { 
                venues: {
                    select: { id: true, name: true, address: true, thumbnail_url: true }
                },
                sender: {
                    select: { full_name: true }
                }
            }
        });

        if (!invite) throw new NotFoundException('Lời mời không tồn tại');
        if (invite.expires_at < new Date()) throw new BadRequestException('Lời mời đã hết hạn');
        if (invite.status !== VenueStaffInviteStatus.PENDING) throw new BadRequestException(`Lời mời đã ${invite.status.toLowerCase()}`);

        return invite;
    }

    async acceptInvite(token: string, userId: string) {
        const invite = await this.getInviteByToken(token);

        // 1. Check if user email matches (optional check depending on how strict we want it)
        // If the invite has receiver_id, check it too.
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: { role: true }
        });
        if (!user) throw new NotFoundException('Không tìm thấy người dùng');

        // Allow only if email matches OR user is an administrator/owner (for testing & flexible onboarding)
        if (invite.invite_email !== user.email) {
            const roleSlug = user.role?.slug;
            const canBypass = ['owner', 'admin', 'super_admin'].includes(roleSlug || '');
            
            if (!canBypass) {
                throw new BadRequestException('Email của bạn không khớp với lời mời này');
            }
            console.log(`>>> [INVITE] Bypassing email check for administrative user: ${user.email}`);
        }

        return await this.prisma.$transaction(async (tx) => {
            // 2. Create venue_staff
            await tx.venue_staff.create({
                data: {
                    venue_id: invite.venue_id,
                    user_id: userId,
                    role: invite.role,
                    joined_at: new Date(),
                    invited_by: invite.sender_id
                }
            });

            // 3. Update invite status
            await tx.venue_staff_invites.update({
                where: { id: invite.id },
                data: { 
                    status: VenueStaffInviteStatus.ACCEPTED,
                    receiver_id: userId,
                    responded_at: new Date()
                }
            });

            // 4. Set is_venue_staff in user profile
            await tx.users.update({
                where: { id: userId },
                data: { is_venue_staff: true } as any
            });

            return { message: 'Chấp nhận lời mời thành công!' };
        });
    }

    async forceAcceptInvite(inviteId: string, ownerId: string) {
        const invite = await this.prisma.venue_staff_invites.findUnique({
            where: { id: inviteId },
            include: { venues: true }
        });

        if (!invite) throw new NotFoundException('Lời mời không tìm thấy');
        if (invite.venues.owner_id !== ownerId) throw new BadRequestException('Bạn không sở hữu cơ sở này');

        // Tìm user theo email của lời mời để lấy ID chính xác
        const user = await this.prisma.users.findUnique({
            where: { email: invite.invite_email }
        });

        if (!user) {
            throw new BadRequestException(`Tài khoản với email ${invite.invite_email} hiện chưa có trong hệ thống. Hãy bảo nhân viên tạo tài khoản trước.`);
        }

        // Gọi hàm acceptInvite với ID của nhân viên chứ không phải của Owner
        return this.acceptInvite(invite.token, user.id);
    }
}
