import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Opportunity } from './entities/opportunity.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FindOpportunitiesQueryDto } from './dto/find-opportunities-query.dto';
import { UserRole } from 'src/enums';
import { User } from 'src/users/entities/user.entity';
import { ApplicationsService } from 'src/applications/applications.service';

@ApiTags('opportunities')
@ApiBearerAuth()
@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO)
  @ApiCreatedResponse({
    description: 'The opportunity has been successfully created.',
    type: Opportunity,
  })
  create(
    @Body(new ValidationPipe()) createOpportunityDto: CreateOpportunityDto,
    @Req() req,
  ) {
    // Optionally, enforce ngoId from authenticated user's ID here for security
    createOpportunityDto.ngoId = req.user.id; // <--- ENSURE ngoId IS SET FROM AUTHENTICATED USER
    return this.opportunitiesService.create(createOpportunityDto);
  }

  @Get()
  @ApiOkResponse({
    description:
      'A list of all opportunities, optionally filtered and paginated.',
    type: [Opportunity],
  }) // Swagger response type slightly misleading, but generally fine
  findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindOpportunitiesQueryDto,
  ) {
    // No change needed here, just call the service method
    return this.opportunitiesService.findAll(query);
  }

  @Get('recent')
  @ApiOkResponse({
    description: 'A list of recent opportunities.',
    type: [Opportunity],
  })
  findRecent(@Query('limit') limitStr?: string) {
    console.log('[OpportunitiesController] findRecent called'); // Add this log
    console.log(
      `[OpportunitiesController] Calling findRecent with limitStr: ${limitStr}`,
    ); // Add this log
    // Renamed to limitStr for clarity
    let limit: number | undefined;
    if (limitStr) {
      const parsed = parseInt(limitStr, 10);
      if (!isNaN(parsed)) {
        // Check if parsing resulted in a valid number
        limit = parsed;
      }
    }
    return this.opportunitiesService.findRecent(limit);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The opportunity found by ID.',
    type: Opportunity,
  })
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO)
  @ApiOkResponse({
    description: 'The opportunity has been successfully updated.',
    type: Opportunity,
  })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOpportunityDto: UpdateOpportunityDto,
    @Req() req, // Add @Req() req here
  ) {
    return this.opportunitiesService.update(
      +id,
      updateOpportunityDto,
      req.user.id,
    ); // Pass req.user.id to service
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO)
  @ApiOkResponse({
    description: 'The opportunity has been successfully deleted.',
  })
  remove(
    @Param('id') id: string,
    @Req() req, // Add @Req() req here
  ) {
    return this.opportunitiesService.remove(+id, req.user.id); // Pass req.user.id to service
  }

  @Get(':opportunityId/applicants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NGO, UserRole.ADMIN) // Only NGOs (who own it) and Admins can view applicants
  @ApiOkResponse({
    description:
      'List of users (volunteers) who applied for the specified opportunity.',
    type: [User], // Returns an array of User objects
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Opportunity not found or you do not have access.',
  })
  async getApplicants(
    @Param('opportunityId') opportunityId: string,
    @Req() req, // To get the requesting NGO's ID
  ): Promise<User[]> {
    // Call the new service method in ApplicationsService
    // req.user.id is the ID of the authenticated user (the NGO or Admin)
    return this.applicationsService.findApplicantsByOpportunityId(
      +opportunityId,
      req.user.id,
    );
  }
}
