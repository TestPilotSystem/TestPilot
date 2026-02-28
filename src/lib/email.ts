import { Resend } from "resend";
import { config } from "@/lib/config";
import { ReactElement } from "react";

const resend = config.resend.apiKey
  ? new Resend(config.resend.apiKey)
  : null;

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY no configurada, email omitido:", subject);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TestPilot <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    if (error) {
      console.error("[Email] Error de Resend:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Email] Error al enviar email:", err);
    return false;
  }
}
