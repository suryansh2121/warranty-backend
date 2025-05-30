const cron = require('node-cron');
const transporter = require('../config/nodemailer');
const Warranty = require('../model/product');

const scheduleReminders = () => {
  cron.schedule('0 0 1 */3 * *', async () => {
    console.log('Running warranty reminder job...');
    try {
      const warranties = await Warranty.find({
        warrantyEndDate: { $gte: new Date() },
      });

      for (const warranty of warranties) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: warranty.userEmail,
          subject: `Warranty Reminder for ${warranty.productName}`,
          html: `
            <h3>Warranty Reminder</h3>
            <p>Your warranty for <strong>${warranty.productName}</strong> is still active.</p>
            <p><strong>Purchase Date:</strong> ${new Date(warranty.purchaseDate).toDateString()}</p>
            <p><strong>Warranty End Date:</strong> ${new Date(warranty.warrantyEndDate).toDateString()}</p>
            <p><strong>Serial Number:</strong> ${warranty.serialNumber || 'N/A'}</p>
            ${warranty.warrantyDocument ? `<p><a href="${warranty.warrantyDocument}">View Warranty Document</a></p>` : ''}
            <p><strong>Notes:</strong> ${warranty.notes || 'None'}</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${warranty.userEmail} for ${warranty.productName}`);
      }
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });
};

module.exports = { scheduleReminders };