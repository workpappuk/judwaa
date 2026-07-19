import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiBriefcase,
  FiDatabase,
  FiDollarSign,
  FiHome,
  FiLayers,
  FiSettings,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

export type HomeCardConfig = {
  id: string;
  title: string;
  content: string;
  url: string;
  icon: IconType;
  requiresAuth?: boolean;
};

export type SidebarLeafItem = {
  label: string;
  href: string;
  icon?: IconType;
  requiresAuth?: boolean;
};

export type SidebarGroupItem = {
  id: string;
  label: string;
  icon?: IconType;
  requiresAuth?: boolean;
  children: SidebarLeafItem[];
};

export type SidebarSingleItem = SidebarLeafItem;

export type SidebarItem = SidebarSingleItem | SidebarGroupItem;

export const HOME_CARDS: HomeCardConfig[] = [
  {
    id: "trading",
    title: "Trading",
    content: "Market watchlists, quotes, and trade workflows.",
    url: "/trading",
    icon: FiTrendingUp,
    requiresAuth: true,
  },
  {
    id: "lms",
    title: "LMS",
    content: "Learning content, exams, and progress tracking.",
    url: "/lms",
    icon: FiBookOpen,
    requiresAuth: true,
  },
  {
    id: "incentive",
    title: "Incentive",
    content: "Track performance incentives and rewards.",
    url: "/incentive",
    icon: FiDollarSign,
    requiresAuth: true,
  },
  {
    id: "data-collector",
    title: "Data Collector",
    content: "Collect and review operational data entries.",
    url: "/data-collector",
    icon: FiDatabase,
    requiresAuth: true,
  },
  {
    id: "rentalproperty",
    title: "Rental Property",
    content: "Manage properties, units, stays, bills, and complaints.",
    url: "/rentalproperty",
    icon: FiHome,
    requiresAuth: true,
  },
  {
    id: "judwaa",
    title: "Judwaa",
    content: "Workspace tools and administration utilities.",
    url: "/judwaa",
    icon: FiLayers,
  },
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: FiBriefcase,
  },
  {
    id: "apps",
    label: "Applications",
    icon: FiLayers,
    children: [
      { label: "Trading", href: "/trading", icon: FiTrendingUp, requiresAuth: true },
      { label: "LMS", href: "/lms", icon: FiBookOpen, requiresAuth: true },
      { label: "Incentive", href: "/incentive", icon: FiDollarSign, requiresAuth: true },
      { label: "Data Collector", href: "/data-collector", icon: FiDatabase, requiresAuth: true },
      { label: "Rental Property", href: "/rentalproperty", icon: FiHome, requiresAuth: true },
      { label: "Judwaa", href: "/judwaa", icon: FiUsers },
    ],
  },
  {
    label: "Auth",
    href: "/auth",
    icon: FiSettings,
  },
];
