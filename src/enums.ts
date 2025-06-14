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
