// src/rabbitmq/rabbitmq.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name); // For logging messages

  async onModuleInit() {
    // This method runs when the module initializes
    try {
      // Connect to RabbitMQ. Get the URL from environment variables for flexibility.
      // Default to localhost if RABBITMQ_URL is not set (useful for local development).
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      );
      this.channel = await this.connection.createChannel(); // Create a channel

      // Assert the exchange. A 'topic' exchange is flexible for routing.
      // 'durable: true' means the exchange will survive a broker restart.
      await this.channel.assertExchange('notification_exchange', 'topic', {
        durable: true,
      });

      this.logger.log(
        'Connected to RabbitMQ and asserted notification_exchange',
      );
    } catch (error) {
      this.logger.error(
        'Failed to connect to RabbitMQ or assert exchange',
        error.stack,
      );
      // In a production app, you might want more robust error handling here
      // like gracefully shutting down or implementing a retry mechanism.
    }
  }

  async onModuleDestroy() {
    // This method runs when the module is destroyed (e.g., app shuts down)
    try {
      await this.channel?.close(); // Close the channel
      await this.connection?.close(); // Close the connection
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error.stack);
    }
  }

  /**
   * Publishes a message to a specified RabbitMQ exchange with a routing key.
   * @param routingKey The routing key for the message (e.g., 'application.new', 'opportunity.created').
   * @param message The message payload to send (will be JSON.stringified).
   */
  async publish(routingKey: string, message: any) {
    if (!this.channel) {
      this.logger.error(
        'RabbitMQ channel not initialized. Cannot publish message.',
      );
      return false; // Indicate failure
    }
    try {
      // Ensure the message is a Buffer
      const bufferMessage = Buffer.from(JSON.stringify(message));

      // 'persistent: true' makes the message durable on disk until consumed.
      // This is crucial for guaranteed delivery.
      const published = this.channel.publish(
        'notification_exchange', // Always publish to our predefined exchange
        routingKey,
        bufferMessage,
        { persistent: true },
      );

      if (published) {
        this.logger.log(`Message published: ${routingKey}`);
        return true;
      } else {
        // This means the buffer is full, and message hasn't been sent immediately
        // In highly concurrent scenarios, you might need to handle this more robustly
        this.logger.warn(
          `Failed to publish message immediately (buffer full): ${routingKey}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error publishing message for routing key '${routingKey}': ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
