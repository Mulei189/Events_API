import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import logger from '#config/logger.js';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Generate QR code for event booking verification
 * @param {Object} bookingData - Booking information
 * @param {number} bookingData.id - Booking ID
 * @param {number} bookingData.userId - User ID
 * @param {number} bookingData.eventId - Event ID
 * @param {string} bookingData.eventTitle - Event title
 * @param {string} bookingData.eventDate - Event date
 * @param {string} bookingData.userEmail - User email
 * @returns {Promise<string>} - Base64 encoded QR code
 */
export const generateQRCode = async (bookingData) => {
    try {
        // Create QR code data with booking information
        const qrData = {
            bookingId: bookingData.id,
            userId: bookingData.userId,
            eventId: bookingData.eventId,
            eventTitle: bookingData.eventTitle,
            eventDate: bookingData.eventDate,
            userEmail: bookingData.userEmail,
            timestamp: new Date().toISOString()
        };

        // Convert to string and generate QR code
        const qrString = JSON.stringify(qrData);
        const qrCodeDataURL = await QRCode.toDataURL(qrString, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M',
            rendererOpts: {
                quality: 1
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        logger.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Send booking confirmation email with QR code
 * @param {Object} bookingDetails - Booking details
 * @param {string} bookingDetails.userEmail - User email
 * @param {string} bookingDetails.userName - User name
 * @param {string} bookingDetails.eventTitle - Event title
 * @param {string} bookingDetails.eventDate - Event date
 * @param {number} bookingDetails.bookingId - Booking ID
 * @param {number} bookingDetails.userId - User ID
 * @param {number} bookingDetails.eventId - Event ID
 * @returns {Promise<boolean>} - Success status
 */
export const sendBookingConfirmationEmail = async (bookingDetails) => {
    try {
        // Generate QR code
        const qrCodeDataURL = await generateQRCode({
            id: bookingDetails.bookingId,
            userId: bookingDetails.userId,
            eventId: bookingDetails.eventId,
            eventTitle: bookingDetails.eventTitle,
            eventDate: bookingDetails.eventDate,
            userEmail: bookingDetails.userEmail
        });

        // Format event date
        const formattedDate = new Date(bookingDetails.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            time: '2-digit'
        });

        // Email HTML template
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Event Booking Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .event-details {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #667eea;
                    }
                    .qr-section {
                        text-align: center;
                        margin: 30px 0;
                        padding: 20px;
                        background: white;
                        border-radius: 8px;
                    }
                    .qr-code {
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 14px;
                    }
                    .booking-id {
                        background: #e8f4f8;
                        padding: 10px;
                        border-radius: 5px;
                        font-family: monospace;
                        text-align: center;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Booking Confirmed!</h1>
                    <p>Your event booking has been successfully confirmed</p>
                </div>
                
                <div class="content">
                    <p>Dear ${bookingDetails.userName},</p>
                    <p>Thank you for booking your spot! We're excited to see you at the event.</p>
                    
                    <div class="event-details">
                        <h3>📅 Event Details</h3>
                        <p><strong>Event:</strong> ${bookingDetails.eventTitle}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                    </div>
                    
                    <div class="qr-section">
                        <h3>📱 Your Entry QR Code</h3>
                        <p>Please present this QR code at the event entrance for verification</p>
                        <div class="qr-code" style="background: white; padding: 20px; border: 2px solid #333; display: inline-block; border-radius: 8px;">
                            <img src="${qrCodeDataURL}" alt="Event QR Code" style="width: 200px; height: 200px; display: block; filter: none !important; -webkit-filter: none !important;">
                        </div>
                        <p><small>This QR code contains your booking details and will be scanned at the venue</small></p>
                        <p><strong>Booking ID:</strong> #${bookingDetails.bookingId}</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <h4>📌 Important Information:</h4>
                        <ul>
                            <li>Please arrive 15 minutes before the event starts</li>
                            <li>Bring a valid ID along with this QR code</li>
                            <li>Screenshot this email for offline access</li>
                            <li>This QR code is unique to your booking and cannot be transferred</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p>If you have any questions, please contact our support team</p>
                    <p>© 2026 Events Booking System. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: bookingDetails.userEmail,
            subject: `🎉 Booking Confirmed: ${bookingDetails.eventTitle}`,
            html: htmlTemplate
        };

        const result = await transporter.sendMail(mailOptions);
        logger.info(`Booking confirmation email sent to ${bookingDetails.userEmail}`, result.messageId);
        return true;

    } catch (error) {
        logger.error('Error sending booking confirmation email:', error);
        throw new Error('Failed to send booking confirmation email');
    }
};

/**
 * Send event cancellation email
 * @param {Object} cancellationDetails - Cancellation details
 * @param {string} cancellationDetails.userEmail - User email
 * @param {string} cancellationDetails.userName - User name
 * @param {string} cancellationDetails.eventTitle - Event title
 * @param {number} cancellationDetails.bookingId - Booking ID
 * @returns {Promise<boolean>} - Success status
 */
export const sendCancellationEmail = async (cancellationDetails) => {
    try {
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Event Booking Cancellation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .booking-info {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #f5576c;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📅 Booking Cancelled</h1>
                    <p>Your event booking has been cancelled</p>
                </div>
                
                <div class="content">
                    <p>Dear ${cancellationDetails.userName},</p>
                    <p>Your booking for the following event has been successfully cancelled:</p>
                    
                    <div class="booking-info">
                        <h3>📋 Cancelled Booking Details</h3>
                        <p><strong>Event:</strong> ${cancellationDetails.eventTitle}</p>
                        <p><strong>Booking ID:</strong> #${cancellationDetails.bookingId}</p>
                        <p><strong>Cancelled on:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
                        <h4>💳 Refund Information:</h4>
                        <p>If you paid for this booking, please allow 5-7 business days for the refund to process to your original payment method.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>We hope to see you at future events!</p>
                    <p>© 2026 Events Booking System. All rights reserved.</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cancellationDetails.userEmail,
            subject: `📅 Booking Cancelled: ${cancellationDetails.eventTitle}`,
            html: htmlTemplate
        };

        const result = await transporter.sendMail(mailOptions);
        logger.info(`Cancellation email sent to ${cancellationDetails.userEmail}`, result.messageId);
        return true;

    } catch (error) {
        logger.error('Error sending cancellation email:', error);
        throw new Error('Failed to send cancellation email');
    }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Success status
 */
export const testEmailConfiguration = async () => {
    try {
        const testMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: '🧪 Email Configuration Test',
            html: '<h1>Email Service Working!</h1><p>This is a test email from the Events Booking System.</p>'
        };

        const result = await transporter.sendMail(testMailOptions);
        logger.info('Test email sent successfully', result.messageId);
        return true;
    } catch (error) {
        logger.error('Email configuration test failed:', error);
        throw new Error('Email configuration test failed');
    }
};