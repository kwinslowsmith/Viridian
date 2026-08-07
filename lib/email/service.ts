import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = 'digest' | 'celebration' | 'alert';

export interface DigestEmailData {
  parentEmail: string;
  parentName: string;
  childName: string;
  className: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalSubmissions: number;
    masteredObjectives: Array<{ standard: string; objective: string }>;
    newObjectivesStarted: Array<{ standard: string; objective: string }>;
    objectivesNeedingSupport: Array<{ standard: string; objective: string; currentMastery: number }>;
  };
  progressByStandard: Array<{
    standard: string;
    previousMastery: number;
    currentMastery: number;
    change: number;
    status: 'improved' | 'stable' | 'declined';
  }>;
}

export interface CelebrationEmailData {
  parentEmail: string;
  parentName: string;
  childName: string;
  objective: string;
  standard: string;
  className: string;
  masteredDate: string;
}

export interface AlertEmailData {
  parentEmail: string;
  parentName: string;
  childName: string;
  className: string;
  threshold: number;
  objectivesNeedingSupport: Array<{
    standard: string;
    objective: string;
    currentMastery: number;
  }>;
}

export async function sendDigestEmail(data: DigestEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: true };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@viridian.edu',
      to: data.parentEmail,
      subject: `Weekly Update: ${data.childName}'s Learning Progress`,
      html: generateDigestEmailHTML(data),
    });

    if (result.error) {
      console.error('Failed to send digest email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending digest email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendCelebrationEmail(data: CelebrationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: true };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@viridian.edu',
      to: data.parentEmail,
      subject: `🎉 ${data.childName} Mastered "${data.objective}"!`,
      html: generateCelebrationEmailHTML(data),
    });

    if (result.error) {
      console.error('Failed to send celebration email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending celebration email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendAlertEmail(data: AlertEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: true };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@viridian.edu',
      to: data.parentEmail,
      subject: `${data.childName} needs support in ${data.className}`,
      html: generateAlertEmailHTML(data),
    });

    if (result.error) {
      console.error('Failed to send alert email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending alert email:', error);
    return { success: false, error: String(error) };
  }
}

function generateDigestEmailHTML(data: DigestEmailData): string {
  const progressHTML = data.progressByStandard
    .map(
      (std) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; color: #1f2937;">${std.standard}</td>
      <td style="padding: 12px 0; text-align: center;">
        <div style="width: 100px; height: 8px; background-color: #e5e7eb; border-radius: 4px; margin: 0 auto;">
          <div style="width: ${std.previousMastery}%; height: 100%; background-color: #9ca3af; border-radius: 4px;"></div>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: center;">
        <div style="width: 100px; height: 8px; background-color: #e5e7eb; border-radius: 4px; margin: 0 auto;">
          <div style="width: ${std.currentMastery}%; height: 100%; background-color: #10b981; border-radius: 4px;"></div>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: center; color: ${std.status === 'improved' ? '#059669' : std.status === 'declined' ? '#dc2626' : '#6b7280'};">
        ${std.status === 'improved' ? '↑' : std.status === 'declined' ? '↓' : '→'} ${Math.abs(std.change)}%
      </td>
    </tr>
  `
    )
    .join('');

  const masteredHTML = data.summary.masteredObjectives
    .map(
      (obj) => `
    <div style="padding: 8px 12px; background-color: #f0fdf4; border-left: 3px solid #10b981; margin-bottom: 8px; border-radius: 4px;">
      <strong style="color: #059669;">✓</strong> ${obj.standard}: <em>${obj.objective}</em>
    </div>
  `
    )
    .join('');

  const newHTML = data.summary.newObjectivesStarted
    .map(
      (obj) => `
    <div style="padding: 8px 12px; background-color: #eff6ff; border-left: 3px solid #3b82f6; margin-bottom: 8px; border-radius: 4px;">
      <strong style="color: #2563eb;">→</strong> ${obj.standard}: <em>${obj.objective}</em>
    </div>
  `
    )
    .join('');

  const supportHTML = data.summary.objectivesNeedingSupport
    .map(
      (obj) => `
    <div style="padding: 8px 12px; background-color: #fef2f2; border-left: 3px solid #ef4444; margin-bottom: 8px; border-radius: 4px;">
      <strong style="color: #dc2626;">⚠</strong> ${obj.standard}: <em>${obj.objective}</em> (${obj.currentMastery}%)
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #374151; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Weekly Learning Update</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Week of ${data.weekStartDate} to ${data.weekEndDate}</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 24px 0;">Hi ${data.parentName},</p>

            <p style="margin: 0 0 24px 0; color: #4b5563;">
              Here's how <strong>${data.childName}</strong> is progressing in <strong>${data.className}</strong> this week.
            </p>

            <!-- Summary Stats -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${data.summary.totalSubmissions}</div>
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Submissions This Week</div>
                </div>
                <div>
                  <div style="font-size: 28px; font-weight: bold; color: #10b981;">${data.summary.masteredObjectives.length}</div>
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Objectives Mastered</div>
                </div>
              </div>
            </div>

            <!-- Progress by Standard -->
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 16px 0; color: #1f2937;">Progress by Standard</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">Standard</th>
                    <th style="text-align: center; padding: 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">Last Week</th>
                    <th style="text-align: center; padding: 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">This Week</th>
                    <th style="text-align: center; padding: 8px 0; font-weight: 600; color: #6b7280; font-size: 12px;">Change</th>
                  </tr>
                </thead>
                <tbody>
                  ${progressHTML}
                </tbody>
              </table>
            </div>

            <!-- Milestones -->
            ${masteredHTML ? `
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #10b981;">🎉 Mastered This Week</h3>
              ${masteredHTML}
            </div>
            ` : ''}

            <!-- New Objectives -->
            ${newHTML ? `
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #3b82f6;">📚 New Learning Started</h3>
              ${newHTML}
            </div>
            ` : ''}

            <!-- Support Needed -->
            ${supportHTML ? `
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; color: #dc2626;">Needs Support</h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">${data.childName} is below ${data.progressByStandard[0]?.['status'] || '80%'} mastery on these objectives:</p>
              ${supportHTML}
            </div>
            ` : ''}

            <!-- CTA -->
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Want to dive deeper?</strong> Visit your dashboard to see detailed explanations of what your child is learning and tips for supporting their progress.
              </p>
            </div>

            <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
              Best,<br>
              The Viridian Team
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              You received this email because you're a parent in the Viridian learning system.
              <br>
              <a href="#" style="color: #3b82f6; text-decoration: none;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateCelebrationEmailHTML(data: CelebrationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #374151; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 32px 24px; text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Congratulations!</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 24px 0; font-size: 16px;">
              Hi ${data.parentName},
            </p>

            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937;">
              <strong>${data.childName}</strong> just mastered
              <br>
              <span style="font-size: 20px; color: #10b981; font-weight: bold;">"${data.objective}"</span>
              <br>
              <span style="font-size: 14px; color: #6b7280;">in ${data.standard}</span>
            </p>

            <!-- Achievement Card -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; margin: 24px 0; border: 2px solid #10b981; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">⭐</div>
              <p style="margin: 0; font-size: 14px; color: #047857;">
                <strong>Mastery Achievement Unlocked</strong>
                <br>
                Completed on ${data.masteredDate}
              </p>
            </div>

            <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563;">
              This is a significant milestone! Mastery means ${data.childName} has demonstrated consistent understanding and can apply what they've learned. You can celebrate this achievement together and encourage them to help peers who are still working toward mastery.
            </p>

            <!-- Next Steps -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1f2937;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                <li style="margin-bottom: 8px;">Check the dashboard to see what ${data.childName} is working on next</li>
                <li style="margin-bottom: 8px;">Consider how they can mentor peers on this skill</li>
                <li>Continue building on this success in other areas</li>
              </ul>
            </div>

            <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
              Best,<br>
              The Viridian Team
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <a href="#" style="color: #3b82f6; text-decoration: none;">View ${data.childName}'s dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateAlertEmailHTML(data: AlertEmailData): string {
  const supportHTML = data.objectivesNeedingSupport
    .map(
      (obj) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; color: #1f2937;">
        <strong>${obj.standard}</strong><br>
        <span style="font-size: 13px; color: #6b7280;">${obj.objective}</span>
      </td>
      <td style="padding: 12px 0; text-align: right;">
        <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${obj.currentMastery}%</div>
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #374151; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Support Needed</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.childName} needs a little help</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 24px 0;">Hi ${data.parentName},</p>

            <p style="margin: 0 0 24px 0; color: #4b5563;">
              ${data.childName} is below ${data.threshold}% mastery on some objectives in <strong>${data.className}</strong>. A little support from home can make a big difference!
            </p>

            <!-- Needs Support Table -->
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 16px 0; color: #1f2937;">Areas Needing Support</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${supportHTML}
                </tbody>
              </table>
            </div>

            <!-- How to Help -->
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #991b1b;">How You Can Help</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                <li style="margin-bottom: 8px;">Chat with your child about what's challenging them</li>
                <li style="margin-bottom: 8px;">Review the explanations and tips in your learning hub</li>
                <li style="margin-bottom: 8px;">Practice together—even 10 minutes a day helps</li>
                <li>Reach out to the teacher if you have questions</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="#" style="background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                View Learning Hub Tips
              </a>
            </div>

            <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
              Remember, mastery takes time. We're here to support you both.<br>
              Best,<br>
              The Viridian Team
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <a href="#" style="color: #3b82f6; text-decoration: none;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
