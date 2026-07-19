import Link from "next/link";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

const SCHOOL_ROUTE_CARDS = [
  {
    title: "Organization Management",
    description: "Create, update and activate/deactivate organizations.",
    href: "/lms/organization-management",
  },
  {
    title: "School Management",
    description: "Create, update and activate/deactivate schools.",
    href: "/lms/school-management",
  },
  {
    title: "Student Management",
    description: "Manage student lifecycle and enrollment records.",
    href: "/lms/student-management",
  },
  {
    title: "Exam Management",
    description: "Manage exams, schedules, and activation workflows.",
    href: "/lms/exam-management",
  },
];

export default function SchoolRoutesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>School Routes</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose a dedicated route to manage school onboarding workflows.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        {SCHOOL_ROUTE_CARDS.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
            <Card variant="outlined" sx={{ "&:hover": { boxShadow: 2 } }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{card.description}</Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
