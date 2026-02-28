import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { config } from "@/lib/config";
import { NotificationType } from "@prisma/client";
import { createElement } from "react";
import AccountApprovedEmail from "@/lib/emails/AccountApprovedEmail";
import AccountRejectedEmail from "@/lib/emails/AccountRejectedEmail";
import AdminMessageEmail from "@/lib/emails/AdminMessageEmail";
import TestSummaryEmail from "@/lib/emails/TestSummaryEmail";

// ─── Types ───────────────────────────────────────────────

interface BaseNotificationData {
  title?: string;
  body?: string;
}

interface AccountApprovedData extends BaseNotificationData {}

interface AccountRejectedData extends BaseNotificationData {
  reason?: string;
}

interface AdminMessageData extends BaseNotificationData {
  messageTitle: string;
  messageBody: string;
}

interface TestSummaryData extends BaseNotificationData {
  testName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

type NotificationDataMap = {
  ACCOUNT_APPROVED: AccountApprovedData;
  ACCOUNT_REJECTED: AccountRejectedData;
  ADMIN_MESSAGE: AdminMessageData;
  TEST_SUMMARY: TestSummaryData;
};

// ─── Default content per type ────────────────────────────

function getDefaultContent(
  type: NotificationType,
  data: any,
  firstName: string
): { title: string; body: string } {
  switch (type) {
    case "ACCOUNT_APPROVED":
      return {
        title: "¡Tu cuenta ha sido aprobada!",
        body: `Hola ${firstName}, tu solicitud de acceso ha sido aprobada. Ya puedes iniciar sesión y comenzar a practicar.`,
      };
    case "ACCOUNT_REJECTED":
      return {
        title: "Tu solicitud ha sido rechazada",
        body: `Hola ${firstName}, lamentamos informarte de que tu solicitud ha sido rechazada. Motivo: ${data.reason || "No especificado"}.`,
      };
    case "ADMIN_MESSAGE":
      return {
        title: data.messageTitle || "Mensaje de tu autoescuela",
        body: data.messageBody || "",
      };
    case "TEST_SUMMARY":
      return {
        title: `Resultado: ${data.score}% en ${data.testName}`,
        body: `Has completado el test "${data.testName}" con un ${data.score}% de aciertos (${data.correctAnswers}/${data.totalQuestions}).`,
      };
  }
}

// ─── Email template builder ──────────────────────────────

function getEmailTemplate(
  type: NotificationType,
  data: any,
  firstName: string,
  appUrl: string
) {
  switch (type) {
    case "ACCOUNT_APPROVED":
      return {
        subject: "¡Tu cuenta en TestPilot ha sido aprobada!",
        react: createElement(AccountApprovedEmail, { firstName, appUrl }),
      };
    case "ACCOUNT_REJECTED":
      return {
        subject: "Actualización sobre tu solicitud en TestPilot",
        react: createElement(AccountRejectedEmail, {
          firstName,
          reason: data.reason || "No especificado",
        }),
      };
    case "ADMIN_MESSAGE":
      return {
        subject: `Mensaje de tu autoescuela: ${data.messageTitle}`,
        react: createElement(AdminMessageEmail, {
          firstName,
          messageTitle: data.messageTitle,
          messageBody: data.messageBody,
          appUrl,
        }),
      };
    case "TEST_SUMMARY":
      return {
        subject: `Resultado de tu test: ${data.score}% — ${data.testName}`,
        react: createElement(TestSummaryEmail, {
          firstName,
          testName: data.testName,
          score: data.score,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers,
          incorrectAnswers: data.incorrectAnswers,
          appUrl,
        }),
      };
  }
}

// ─── Main helper ─────────────────────────────────────────

export async function createNotification<T extends NotificationType>(
  userId: number,
  type: T,
  data: NotificationDataMap[T]
) {
  // Fetch user info for email and name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  if (!user) {
    console.error(`[Notification] Usuario ${userId} no encontrado`);
    return null;
  }

  const { title, body } = data.title && data.body
    ? { title: data.title, body: data.body }
    : getDefaultContent(type, data, user.firstName);

  // Create DB notification and send email in parallel
  const appUrl = config.app.url;
  const emailTemplate = getEmailTemplate(type, data, user.firstName, appUrl);

  const [notification, emailSent] = await Promise.all([
    prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
      },
    }),
    sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      react: emailTemplate.react,
    }),
  ]);

  // Update emailSent flag
  if (emailSent) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { emailSent: true },
    });
  }

  return notification;
}
