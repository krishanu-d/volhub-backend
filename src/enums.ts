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

export enum OpportunityCategory {
  ENVIRONMENT = 'environment',
  EDUCATION = 'education',
  HEALTH = 'health',
  COMMUNITY = 'community',
  ANIMAL_WELFARE = 'animal-welfare',
  ART_CULTURE = 'art-culture',
  TECHNOLOGY = 'technology',
  SPORTS_RECREATION = 'sports-recreation',
  HUMAN_RIGHTS = 'human-rights',
  DISASTER_RELIEF = 'disaster-relieft',
  ELDERLY_CARE = 'elderly-care',
  CHILDREN_YOUTH = 'children-youth',
  HOMELESS_SUPPORT = 'homeless-support',
  FOOD_SECURITY = 'food-security',
  // You can add more categories here as needed for your project!
}

export enum OpportunitySortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  // Add other sortable fields as needed. Use exact property names from the entity.
  NGO_NAME = 'ngo.name', // For sorting by NGO name, will require specific handling
  DISTANCE = 'distance', // This will be a calculated field for sorting
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// src/enums.ts

export enum RabbitMQRoutingKey {
  APPLICATION_NEW = 'application.new',
  APPLICATION_STATUS_CHANGED = 'application.status_changed',
  OPPORTUNITY_CREATED = 'opportunity.created',
  OPPORTUNITY_UPDATED = 'opportunity.updated',
  OPPORTUNITY_DELETED = 'opportunity.deleted',
}

export enum RabbitMQEventType {
  // Change 'application.new' to 'NGO_NEW_APPLICATION'
  APPLICATION_NEW = 'NGO_NEW_APPLICATION', // <--- IMPORTANT CHANGE HERE
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED', // Consider if Go uses this exact string or a generic status update
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  APPLICATION_COMPLETED = 'APPLICATION_COMPLETED',
  APPLICATION_STATUS_CHANGED = 'VOLUNTEER_APPLICATION_STATUS_UPDATE', // Change to match Go's case
  OPPORTUNITY_CREATED = 'VOLUNTEER_NEW_MATCHING_OPPORTUNITY', // Change to match Go's case
  OPPORTUNITY_UPDATED = 'OPPORTUNITY_UPDATED', // Go will need a case for this
  OPPORTUNITY_DELETED = 'OPPORTUNITY_DELETED', // Go will need a case for this
}
