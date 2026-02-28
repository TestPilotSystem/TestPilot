import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface AccountRejectedEmailProps {
  firstName: string;
  reason: string;
}

export default function AccountRejectedEmail({
  firstName,
  reason,
}: AccountRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Actualización sobre tu solicitud en TestPilot</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>🚗 TestPilot</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Hola, {firstName}</Text>
            <Text style={paragraph}>
              Lamentamos informarte de que tu solicitud de acceso ha sido{" "}
              <strong style={{ color: "#EF4444" }}>rechazada</strong>.
            </Text>

            <Section style={reasonBox}>
              <Text style={reasonLabel}>Motivo:</Text>
              <Text style={reasonText}>{reason || "No especificado"}</Text>
            </Section>

            <Text style={paragraph}>
              Si crees que se trata de un error, ponte en contacto con tu
              autoescuela para más información.
            </Text>
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

const reasonBox = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: "12px",
  padding: "16px 20px",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  marginBottom: "24px",
};

const reasonLabel = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#EF4444",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const reasonText = {
  fontSize: "15px",
  color: "#F8FAFC",
  margin: "0",
  lineHeight: "22px",
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
