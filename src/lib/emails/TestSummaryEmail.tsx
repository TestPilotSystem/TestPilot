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

interface TestSummaryEmailProps {
  firstName: string;
  testName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  appUrl: string;
}

export default function TestSummaryEmail({
  firstName,
  testName,
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  appUrl,
}: TestSummaryEmailProps) {
  const passed = score >= 90;

  return (
    <Html>
      <Head />
      <Preview>
        {`Resultado de tu test: ${score}% — ${passed ? "¡Aprobado!" : "A seguir practicando"}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>🚗 TestPilot</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Resumen de tu test</Text>
            <Text style={paragraph}>
              Hola {firstName}, aquí tienes el resumen de tu test{" "}
              <strong style={{ color: "#F8FAFC" }}>{testName}</strong>:
            </Text>

            <Section style={scoreBox(passed)}>
              <Text style={scoreValue}>{score}%</Text>
              <Text style={scoreLabel}>
                {passed ? "✅ Aprobado" : "❌ No aprobado"}
              </Text>
            </Section>

            <Section style={statsRow}>
              <Section style={statItem}>
                <Text style={statValue}>{totalQuestions}</Text>
                <Text style={statLabel}>Preguntas</Text>
              </Section>
              <Section style={statItem}>
                <Text style={{ ...statValue, color: "#22C55E" }}>{correctAnswers}</Text>
                <Text style={statLabel}>Aciertos</Text>
              </Section>
              <Section style={statItem}>
                <Text style={{ ...statValue, color: "#EF4444" }}>{incorrectAnswers}</Text>
                <Text style={statLabel}>Fallos</Text>
              </Section>
            </Section>

            <Button style={button} href={`${appUrl}/estudiante/driving-tests`}>
              Seguir practicando
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

const scoreBox = (passed: boolean) => ({
  backgroundColor: passed ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
  borderRadius: "16px",
  padding: "24px",
  border: `1px solid ${passed ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
  textAlign: "center" as const,
  marginBottom: "24px",
});

const scoreValue = {
  fontSize: "48px",
  fontWeight: "bold" as const,
  color: "#F8FAFC",
  margin: "0",
  lineHeight: "1",
};

const scoreLabel = {
  fontSize: "16px",
  color: "#94A3B8",
  margin: "8px 0 0",
};

const statsRow = {
  display: "flex" as const,
  justifyContent: "space-around" as const,
  marginBottom: "24px",
};

const statItem = {
  textAlign: "center" as const,
  display: "inline-block" as const,
  width: "30%",
};

const statValue = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#F8FAFC",
  margin: "0",
};

const statLabel = {
  fontSize: "12px",
  color: "#64748B",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "4px 0 0",
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
