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
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Opportunity } from './entities/opportunity.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('opportunities')
@ApiBearerAuth()
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Only logged-in users can create opportunities (we might want to restrict this to NGOs later)
  @ApiCreatedResponse({
    description: 'The opportunity has been successfully created.',
    type: Opportunity,
  })
  create(
    @Body(new ValidationPipe()) createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(createOpportunityDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'A list of all opportunities.',
    type: [Opportunity],
  })
  findAll() {
    return this.opportunitiesService.findAll();
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
  @UseGuards(JwtAuthGuard) // Only logged-in users can update opportunities (we might want to restrict this to the posting NGO later)
  @ApiOkResponse({
    description: 'The opportunity has been successfully updated.',
    type: Opportunity,
  })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(+id, updateOpportunityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Only logged-in users can delete opportunities (we might want to restrict this to the posting NGO later)
  @ApiOkResponse({
    description: 'The opportunity has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(+id);
  }

  @Get('recent')
  @ApiOkResponse({
    description: 'A list of recent opportunities.',
    type: [Opportunity],
  })
  findRecent(@Query('limit') limit?: string) {
    return this.opportunitiesService.findRecent(
      limit ? parseInt(limit, 10) : undefined,
    );
  }
}
