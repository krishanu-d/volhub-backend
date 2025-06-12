export enum UserRole {
  VOLUNTEER = 'volunteer',
  NGO = 'ngo',
  ADMIN = 'admin',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  COMPLETED = 'completed', // For when the opportunity is done
}

export enum OpportunityOrderBy {
  CREATED_AT = 'createdAt',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  TITLE = 'title',
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
