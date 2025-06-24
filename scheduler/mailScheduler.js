const cron = require('node-cron');
const transporter = require('../config/nodemailer');
const Warranty = require('../model/product');

const scheduleReminders = () => {
  
  cron.schedule('* * * * *', async () => {
    console.log('Running warranty reminder job...');

    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    try {
      const warranties = await Warranty.find({
        warrantyEndDate: { $gte: now, $lte: next30Days },
      });

      let sentCount = 0;

      for (const warranty of warranties) {
        
        const lastSent = warranty.lastReminderSent;
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (lastSent && new Date(lastSent) > threeMonthsAgo) {
          continue;
        }

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: warranty.userEmail,
          subject: `Warranty Reminder for ${warranty.productName}`,
          html: `
            <h3>Warranty Reminder</h3>
            <p>Your warranty for <strong>${warranty.productName}</strong> is expiring soon!</p>
            <p><strong>Purchase Date:</strong> ${new Date(warranty.purchaseDate).toDateString()}</p>
            <p><strong>Warranty End Date:</strong> ${new Date(warranty.warrantyEndDate).toDateString()}</p>
            <p><strong>Serial Number:</strong> ${warranty.serialNumber || 'N/A'}</p>
            ${
              warranty.warrantyDocument
                ? `<p><a href="${warranty.warrantyDocument}">View Warranty Document</a></p>`
                : ''
            }
            <p><strong>Notes:</strong> ${warranty.notes || 'None'}</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Reminder sent to ${warranty.userEmail} for ${warranty.productName}`);
          warranty.lastReminderSent = new Date();
          await warranty.save();
          sentCount++;
        } catch (err) {
          console.error(`Failed to send email to ${warranty.userEmail}:`, err.message);
        }
      }

      console.log(`Warranty reminders sent: ${sentCount}`);
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });
};

module.exports = { scheduleReminders };
