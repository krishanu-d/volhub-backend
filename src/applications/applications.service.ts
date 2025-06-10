import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Opportunity)
    private opportunitiesRepository: Repository<Opportunity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>, // Inject User repository to check volunteer role
  ) {}

  // Service method to create a new application
  async create(
    createApplicationDto: CreateApplicationDto,
    volunteerId: number,
  ): Promise<Application> {
    const { opportunityId, message } = createApplicationDto;

    // 1. Verify Opportunity exists
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id: opportunityId },
    });
    if (!opportunity) {
      throw new NotFoundException(
        `Opportunity with ID ${opportunityId} not found.`,
      );
    }

    // 2. Verify User is a Volunteer (Optional but good for robustness)
    const volunteer = await this.usersRepository.findOne({
      where: { id: volunteerId },
    });
    if (!volunteer || volunteer.role !== UserRole.VOLUNTEER) {
      throw new ForbiddenException(
        'Only volunteers can apply for opportunities.',
      );
    }

    // 3. Check if volunteer has already applied to this opportunity
    const existingApplication = await this.applicationsRepository.findOne({
      where: { volunteerId, opportunityId },
    });
    if (existingApplication) {
      throw new BadRequestException(
        'You have already applied for this opportunity.',
      );
    }

    // Create the new application
    const newApplication = this.applicationsRepository.create({
      volunteerId,
      opportunityId,
      message,
      status: ApplicationStatus.PENDING, // Default status
    });

    return this.applicationsRepository.save(newApplication);
  }

  // Service method for a volunteer to view their own applications
  async findApplicationsByVolunteer(
    volunteerId: number,
  ): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { volunteerId },
      relations: ['opportunity', 'opportunity.ngo'], // Load related opportunity and its NGO
      order: { applicationDate: 'DESC' },
    });
  }

  // Service method for an NGO to view applications for their opportunities
  async findApplicationsByOpportunity(
    opportunityId: number,
    ngoId: number,
  ): Promise<Application[]> {
    // 1. Verify Opportunity exists and belongs to the requesting NGO
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id: opportunityId },
    });
    if (!opportunity) {
      throw new NotFoundException(
        `Opportunity with ID ${opportunityId} not found.`,
      );
    }
    if (opportunity.ngoId !== ngoId) {
      throw new ForbiddenException(
        'You are not authorized to view applications for this opportunity.',
      );
    }

    // 2. Find applications for this opportunity, loading volunteer details
    return this.applicationsRepository.find({
      where: { opportunityId },
      relations: ['volunteer'], // Load related volunteer details
      order: { applicationDate: 'ASC' },
    });
  }

  // Service method for an NGO to update application status
  async updateApplicationStatus(
    applicationId: number,
    newStatus: ApplicationStatus,
    ngoId: number, // NGO making the change
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['opportunity'], // Load opportunity to check ownership
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found.`,
      );
    }

    // Verify the NGO owns the opportunity associated with this application
    if (application.opportunity.ngoId !== ngoId) {
      throw new ForbiddenException(
        'You are not authorized to update this application.',
      );
    }

    // Prevent changing status from terminal states or to invalid states
    if (
      [
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.COMPLETED,
      ].includes(application.status) &&
      ![ApplicationStatus.COMPLETED].includes(newStatus)
    ) {
      // Allow moving to COMPLETED from other states if desired, but not back
      throw new BadRequestException(
        `Cannot change status from ${application.status}.`,
      );
    }

    if (!Object.values(ApplicationStatus).includes(newStatus)) {
      throw new BadRequestException(`Invalid application status: ${newStatus}`);
    }

    application.status = newStatus;
    return this.applicationsRepository.save(application);
  }

  // Service method for a volunteer to withdraw their application
  async withdrawApplication(
    applicationId: number,
    volunteerId: number,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found.`,
      );
    }

    // Verify the volunteer owns this application
    if (application.volunteerId !== volunteerId) {
      throw new ForbiddenException(
        'You are not authorized to withdraw this application.',
      );
    }

    // Only allow withdrawing if status is PENDING or ACCEPTED (if NGO needs to know)
    if (
      application.status === ApplicationStatus.WITHDRAWN ||
      application.status === ApplicationStatus.REJECTED ||
      application.status === ApplicationStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot withdraw application with status: ${application.status}.`,
      );
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return this.applicationsRepository.save(application);
  }

  async findApplicantsByOpportunityId(
    opportunityId: number,
    ngoUserId: number,
  ): Promise<User[]> {
    // 1. Verify the opportunity exists and belongs to the requesting NGO
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id: opportunityId },
      relations: ['ngo'], // Eager load the NGO relation
    });

    if (!opportunity) {
      throw new NotFoundException(
        `Opportunity with ID ${opportunityId} not found.`,
      );
    }

    // Ensure the requesting NGO owns this opportunity
    if (opportunity.ngo.id !== ngoUserId) {
      // If the NGO making the request is not the one who posted the opportunity,
      // and they are not an ADMIN, deny access.
      throw new NotFoundException(
        `Opportunity with ID ${opportunityId} not found or you do not have access.`,
      );
    }

    // 2. Find all applications for this opportunity and load the associated volunteer
    const applications = await this.applicationsRepository.find({
      where: { opportunity: { id: opportunityId } }, // Filter by opportunity ID
      relations: ['volunteer'], // Eager load the 'volunteer' (User) relation
    });

    if (applications.length === 0) {
      // No applicants found for this opportunity, which is a valid state
      return [];
    }

    const applicants: User[] = applications.map((app) => app.volunteer);

    return applicants;
  }
}
