import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Application } from './entities/application.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApplicationStatus, UserRole } from 'src/enums';

@ApiTags('applications')
@ApiBearerAuth() // Indicates that JWT token is required for these endpoints
@Controller() // Base controller, routes will be prefixed by modules
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // Endpoint for a Volunteer to apply for an opportunity
  // POST /applications
  @Post('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VOLUNTEER) // Only volunteers can apply
  @ApiCreatedResponse({
    description: 'Application submitted successfully.',
    type: Application,
  })
  async create(
    @Body(new ValidationPipe()) createApplicationDto: CreateApplicationDto,
    @Req() req,
  ) {
    // volunteerId is taken from the authenticated user
    return this.applicationsService.create(createApplicationDto, req.user.id);
  }

  // Endpoint for a Volunteer to view their own applications
  // GET /users/me/applications (Note: This route is commonly placed under /users module, but for now we can put it here)
  @Get('users/me/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VOLUNTEER) // Only volunteers can view their own applications
  @ApiOkResponse({
    description: 'List of applications made by the current volunteer.',
    type: [Application],
  })
  async findMyApplications(@Req() req) {
    return this.applicationsService.findApplicationsByVolunteer(req.user.id);
  }

  // Endpoint for an NGO to view applications for a specific opportunity they own
  // GET /opportunities/:id/applications
  @Get('opportunities/:id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO) // Only NGOs can view applications for their opportunities
  @ApiOkResponse({
    description: 'List of applications for a specific opportunity.',
    type: [Application],
  })
  async findApplicationsForOpportunity(
    @Param('id') opportunityId: string, // Opportunity ID
    @Req() req,
  ) {
    return this.applicationsService.findApplicationsByOpportunity(
      +opportunityId,
      req.user.id,
    );
  }

  // Endpoint for an NGO to update the status of an application
  // PATCH /applications/:id/status
  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO) // Only NGOs can update application status
  @ApiOkResponse({
    description: 'Application status updated successfully.',
    type: Application,
  })
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body('status', new ValidationPipe({ transform: true }))
    status: ApplicationStatus, // Only expect 'status' field from body
    @Req() req,
  ) {
    return this.applicationsService.updateApplicationStatus(
      +applicationId,
      status,
      req.user.id,
    );
  }

  // Endpoint for a Volunteer to withdraw their application
  // PATCH /applications/:id/withdraw
  @Patch('applications/:id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VOLUNTEER) // Only volunteers can withdraw their own application
  @ApiOkResponse({
    description: 'Application withdrawn successfully.',
    type: Application,
  })
  async withdrawApplication(@Param('id') applicationId: string, @Req() req) {
    return this.applicationsService.withdrawApplication(
      +applicationId,
      req.user.id,
    );
  }
}
