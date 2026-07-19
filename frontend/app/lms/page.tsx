import Link from "next/link";
import { FiBookOpen, FiClipboard, FiMap, FiUserCheck, FiUsers } from "react-icons/fi";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

const LMS_CARDS = [
  {
    title: "Organization Management",
    description: "Dedicated route to manage organization CRUD.",
    href: "/lms/organization-management",
    icon: FiUsers,
  },
  {
    title: "School Management",
    description: "Dedicated route to manage school CRUD.",
    href: "/lms/school-management",
    icon: FiBookOpen,
  },
  {
    title: "School Routes",
    description: "Route map for school onboarding and management flows.",
    href: "/lms/school-routes",
    icon: FiMap,
  },
  {
    title: "Student Management",
    description: "Dedicated route to manage student workflows.",
    href: "/lms/student-management",
    icon: FiUserCheck,
  },
  {
    title: "Exam Management",
    description: "Dedicated route to manage exam workflows.",
    href: "/lms/exam-management",
    icon: FiClipboard,
  },
];

export default function LmsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>LMS Route Hub</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Navigate to dedicated management routes for organization, school, student, and exam workflows.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" } }}>
        {LMS_CARDS.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
            <Card variant="outlined" sx={{ "&:hover": { boxShadow: 2 } }}>
              <CardContent>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "action.hover", display: "grid", placeItems: "center" }}>
                  <card.icon size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 700 }}>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{card.description}</Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Container>
  );
}
