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

interface AccountApprovedEmailProps {
  firstName: string;
  appUrl: string;
}

export default function AccountApprovedEmail({
  firstName,
  appUrl,
}: AccountApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Tu cuenta ha sido aprobada en TestPilot!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>🚗 TestPilot</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>¡Bienvenido/a, {firstName}!</Text>
            <Text style={paragraph}>
              Tu solicitud de acceso ha sido <strong>aprobada</strong>. Ya
              puedes acceder a la plataforma y comenzar a preparar tu examen
              teórico de conducir.
            </Text>

            <Button style={button} href={`${appUrl}/login`}>
              Iniciar sesión
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
