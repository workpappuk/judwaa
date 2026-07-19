
import Link from "next/link";
import { Box, Card, Typography } from "@mui/material";
import type { IconType } from "react-icons";
import { FiArrowUpRight, FiLogOut, FiShield } from "react-icons/fi";

export default function AdminHome() {
  type Card = {
    id: number;
    title: string;
    content: string;
    url: string;
    icon: IconType;
  };

  const cards: Card[] = [
      { id: 1, title: "Nocode", content: "Metadata platform admin", url: "/judwaa/admin/nocode", icon: FiShield },
      { id: 5, title: "Force Logout", content: "Blacklist user token", url: "/judwaa/admin/security/forcelogout", icon: FiLogOut },
  ];

  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 7rem)",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        {cards.map((card) => (
          <Link key={card.id} href={card.url} style={{ textDecoration: "none", color: "inherit" }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                transition: "box-shadow 180ms ease, transform 180ms ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                    color: "text.secondary",
                  }}
                >
                  <card.icon size={16} />
                </Box>

                <Box sx={{ width: 16, height: 16, color: "text.secondary" }}>
                  <FiArrowUpRight size={16} />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 700 }}>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.content}
              </Typography>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
