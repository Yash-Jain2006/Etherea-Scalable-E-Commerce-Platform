import boto3
import os
import logging

logger = logging.getLogger(__name__)

def send_order_confirmation_email(user_email, user_name, order):
    """
    Sends an order confirmation email via AWS SES.
    If AWS credentials are not configured, it logs the email to the console instead.
    """
    aws_region = os.getenv('AWS_REGION', 'ap-south-1')
    sender_email = os.getenv('SENDER_EMAIL', 'noreply@etherea-ecommerce.com')
    
    subject = f"Order Confirmation #{order.id} - Etherea"
    
    body_text = f"Hi {user_name},\n\nThank you for your order!\n\nOrder ID: {order.id}\nTotal: ₹{order.total}\nStatus: {order.status}\n\nWe will notify you once it ships.\n\nBest,\nThe Etherea Team"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
      <h2>Hi {user_name},</h2>
      <p>Thank you for shopping with <strong>Etherea</strong>!</p>
      <p>Your order <strong>#{order.id}</strong> has been confirmed.</p>
      <ul>
        <li><strong>Total:</strong> ₹{order.total}</li>
        <li><strong>Status:</strong> {order.status}</li>
      </ul>
      <p>We will notify you once your items ship.</p>
      <br>
      <p>Best regards,<br>The Etherea Team</p>
    </body>
    </html>
    """

    # Check if we are in a local environment without actual AWS keys
    if os.getenv('AWS_ACCESS_KEY_ID') == 'mock-key':
        logger.info(f"MOCK EMAIL SENT TO: {user_email}")
        logger.info(f"SUBJECT: {subject}")
        logger.info(f"BODY: {body_text}")
        return True

    try:
        client = boto3.client('ses', region_name=aws_region)
        response = client.send_email(
            Destination={'ToAddresses': [user_email]},
            Message={
                'Body': {
                    'Html': {'Charset': 'UTF-8', 'Data': body_html},
                    'Text': {'Charset': 'UTF-8', 'Data': body_text},
                },
                'Subject': {'Charset': 'UTF-8', 'Data': subject},
            },
            Source=sender_email,
        )
        logger.info(f"Email sent! Message ID: {response['MessageId']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        # We don't want an email failure to fail the entire checkout process
        return False
