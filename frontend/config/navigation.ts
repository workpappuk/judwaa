import type { IconType } from "react-icons";
import type { UserRole } from "@/types/auth";
import {
  FiBookOpen,
  FiDatabase,
  FiHome,
  FiLogOut,
  FiMap,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

export type AppRoute = {
  href: string;
  label: string;
  description: string;
  icon: IconType;
  requiresAuth?: boolean;
  requiresRole?: UserRole | UserRole[];
};

export type HomeCardConfig = {
  id: number;
  title: string;
  content: string;
  url: string;
  icon: IconType;
  requiresAuth?: boolean;
  requiresRole?: UserRole | UserRole[];
};

export type SidebarLeafItem = {
  href: string;
  label: string;
  icon?: IconType;
  requiresAuth?: boolean;
  requiresRole?: UserRole | UserRole[];
};

export type SidebarGroupItem = {
  id: string;
  label: string;
  icon?: IconType;
  requiresAuth?: boolean;
  requiresRole?: UserRole | UserRole[];
  children: SidebarLeafItem[];
};

export type SidebarItem = SidebarLeafItem | SidebarGroupItem;

const ROUTES = {
  home: { href: "/", label: "Home", description: "Landing page", icon: FiHome },
  auth: { href: "/auth", label: "Auth", description: "Login and registration", icon: FiUserCheck },
  tradingFo: { href: "/trading/f&o", label: "F&O", description: "Live market dashboard", icon: FiTrendingUp, requiresAuth: true },
  tradingInstrument: {
    href: "/trading/instrument",
    label: "Instruments",
    description: "List of all instruments",
    icon: FiBookOpen,
    requiresAuth: true,
  },
  tradingStoploss: {
    href: "/trading/calculator/stoploss",
    label: "Stoploss Calculator",
    description: "Risk and stoploss calculator",
    icon: FiTrendingUp,
  },
  admin: { href: "/judwaa/admin", label: "Admin", description: "Admin dashboard", icon: FiShield, requiresAuth: true, requiresRole: "admin" },
  nocodeAdmin: {
    href: "/judwaa/admin/nocode",
    label: "Nocode",
    description: "Metadata platform admin",
    icon: FiShield,
    requiresAuth: true,
    requiresRole: "admin",
  },
  nocodeStudio: {
    href: "/judwaa/admin/nocode/studio",
    label: "Studio",
    description: "Metadata studio",
    icon: FiBookOpen,
    requiresAuth: true,
    requiresRole: "admin",
  },
  nocodeMarketing: {
    href: "/nocode/marketing",
    label: "Marketing",
    description: "Nocode platform marketing page",
    icon: FiTrendingUp,
    requiresAuth: false,
  },
  nocodeOnboard: {
    href: "/nocode/onboard",
    label: "Self Onboard",
    description: "Company self-serve onboarding",
    icon: FiUsers,
    requiresAuth: false,
  },
  incentive: {
    href: "/incentive",
    label: "Incentive",
    description: "Scheme and rule manager",
    icon: FiLogOut,
    requiresAuth: true,
  },
  dataCollector: {
    href: "/data-collector",
    label: "Data Collector",
    description: "Step-based ingestion setup",
    icon: FiDatabase,
    requiresAuth: true,
  },
  rentalProperty: {
    href: "/rentalproperty",
    label: "Rental Property",
    description: "Manage properties, units, stays, bills, and complaints",
    icon: FiHome,
    requiresAuth: true,
  },
  judwaa: {
    href: "/judwaa",
    label: "Judwaa",
    description: "Workspace tools and administration utilities",
    icon: FiUsers,
    requiresAuth: false,
  },
  lmsHub: {
    href: "/lms",
    label: "Route Hub",
    description: "School and student onboarding",
    icon: FiUsers,
    requiresAuth: true,
  },
  lmsOrganization: {
    href: "/lms/organization-management",
    label: "Organization",
    description: "Organization management",
    icon: FiUsers,
    requiresAuth: true,
  },
  lmsSchool: {
    href: "/lms/school-management",
    label: "School",
    description: "School management",
    icon: FiBookOpen,
    requiresAuth: true,
  },
  lmsRoutes: {
    href: "/lms/school-routes",
    label: "School Routes",
    description: "LMS route map",
    icon: FiMap,
    requiresAuth: true,
  },
  adminForceLogout: {
    href: "/judwaa/admin/security/forcelogout",
    label: "Force Logout",
    description: "Token revocation controls",
    icon: FiLogOut,
    requiresAuth: true,
    requiresRole: "admin",
  },
} satisfies Record<string, AppRoute>;

const route = <K extends keyof typeof ROUTES>(key: K): AppRoute => ROUTES[key];

export const HOME_CARDS: HomeCardConfig[] = [
  route("tradingFo"),
  route("tradingInstrument"),
  route("auth"),
  route("admin"),
  route("incentive"),
  route("dataCollector"),
  route("rentalProperty"),
  {
    ...route("lmsHub"),
    label: "LMS",
  },
  route("nocodeAdmin"),
].map((entry, index) => ({
  id: index + 1,
  title: entry.label,
  content: entry.description,
  url: entry.href,
  icon: entry.icon,
  requiresAuth: entry.requiresAuth,
  requiresRole: entry.requiresRole,
}));

const asLeaf = <K extends keyof typeof ROUTES>(key: K, overrides?: Partial<SidebarLeafItem>): SidebarLeafItem => {
  const item = route(key);
  return {
    href: item.href,
    label: overrides?.label ?? item.label,
    icon: overrides?.icon ?? item.icon,
    requiresAuth: overrides?.requiresAuth ?? item.requiresAuth,
    requiresRole: overrides?.requiresRole ?? item.requiresRole,
  };
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  asLeaf("home"),
  {
    id: "trading",
    label: "Trading",
    icon: FiTrendingUp,
    requiresAuth: true,
    children: [asLeaf("tradingFo"), asLeaf("tradingInstrument"), asLeaf("tradingStoploss")],
  },
  {
    id: "operations",
    label: "Operations",
    icon: FiShield,
    children: [
      asLeaf("auth"),
      asLeaf("admin", { requiresRole: "admin" }),
      asLeaf("adminForceLogout", { requiresRole: "admin" }),
      asLeaf("incentive"),
      asLeaf("dataCollector"),
      asLeaf("rentalProperty"),
      asLeaf("judwaa"),
    ],
  },
  {
    id: "nocode",
    label: "Nocode",
    icon: FiShield,
    requiresAuth: true,
    children: [asLeaf("nocodeAdmin", { label: "Platform Admin" }), asLeaf("nocodeStudio"), asLeaf("nocodeMarketing"), asLeaf("nocodeOnboard")],
  },
  {
    id: "lms",
    label: "LMS",
    icon: FiUsers,
    requiresAuth: true,
    children: [
      asLeaf("lmsHub"),
      asLeaf("lmsOrganization"),
      asLeaf("lmsSchool"),
      asLeaf("lmsRoutes"),
    ],
  },
];
