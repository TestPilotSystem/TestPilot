import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";

interface AdminMessageEmailProps {
  firstName: string;
  messageTitle: string;
  messageBody: string;
  appUrl: string;
}

export default function AdminMessageEmail({
  firstName,
  messageTitle,
  messageBody,
  appUrl,
}: AdminMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo mensaje de tu autoescuela: {messageTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>🚗 TestPilot</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Hola, {firstName}</Text>
            <Text style={paragraph}>
              Has recibido un nuevo mensaje de tu autoescuela:
            </Text>

            <Section style={messageBox}>
              <Text style={messageTitle_style}>{messageTitle}</Text>
              <Text style={messageBody_style}>{messageBody}</Text>
            </Section>

            <Button style={button} href={`${appUrl}/estudiante/notificaciones`}>
              Ver en TestPilot
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            TestPilot — Tu autoescuela digital
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0F172A",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const headerSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logo = {
  fontSize: "28px",
  fontWeight: "bold" as const,
  color: "#3B82F6",
};

const contentSection = {
  backgroundColor: "#1E293B",
  borderRadius: "16px",
  padding: "40px 32px",
  border: "1px solid rgba(51, 65, 85, 0.5)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#F8FAFC",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#94A3B8",
  margin: "0 0 24px",
};

const messageBox = {
  backgroundColor: "rgba(37, 99, 235, 0.1)",
  borderRadius: "12px",
  padding: "20px 24px",
  border: "1px solid rgba(37, 99, 235, 0.2)",
  marginBottom: "24px",
};

const messageTitle_style = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#F8FAFC",
  margin: "0 0 8px",
};

const messageBody_style = {
  fontSize: "15px",
  color: "#CBD5E1",
  margin: "0",
  lineHeight: "24px",
  whiteSpace: "pre-wrap" as const,
};

const button = {
  backgroundColor: "#2563EB",
  borderRadius: "12px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const hr = {
  borderColor: "rgba(51, 65, 85, 0.5)",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#64748B",
  textAlign: "center" as const,
};
