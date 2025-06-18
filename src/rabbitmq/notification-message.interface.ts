import { RabbitMQEventType } from 'src/enums';

// Mirrors the Go Recipient struct
export interface INotificationRecipient {
  user_id: string;
  email_address?: string; // Optional, only if applicable
  device_token?: string; // Optional, only if applicable
  prefs: {
    receive_email: boolean;
    receive_push: boolean;
  };
}

// Flexible payload interface to hold various event-specific data
// Mirrors the Go Payload struct
export interface INotificationPayload {
  title?: string;
  body?: string; // For push notifications
  subject?: string; // For emails
  deep_link?: string;
  // Add other common properties that might appear across different notification types
  application_id?: number;
  opportunity_id?: number;
  volunteer_id?: number;
  volunteer_name?: string;
  ngo_id?: number;
  ngo_name?: string;
  old_status?: string; // For status changes
  new_status?: string; // For status changes

  // Use an index signature to allow for any other properties without explicitly defining them
  [key: string]: any;
}

// The main interface for the message sent to RabbitMQ, mirroring Go's NotificationMessage
export interface IGenericNotificationMessage {
  notification_type: RabbitMQEventType; // Use the enum here
  recipient: INotificationRecipient;
  payload: INotificationPayload;
}
