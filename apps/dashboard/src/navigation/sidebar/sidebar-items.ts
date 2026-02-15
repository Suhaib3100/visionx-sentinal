import {
  Trophy,
  Users,
  FolderGit,
  Activity,
  BarChart3,
  Shield,
  Key,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "VisionX Eval",
    items: [
      {
        title: "Leaderboard",
        url: "/dashboard/leaderboard",
        icon: Trophy,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: FolderGit,
      },
      {
        title: "Evaluations",
        url: "/dashboard/evaluations",
        icon: Activity,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
  {
    id: 2,
    label: "Administration",
    items: [
      {
        title: "Team Management",
        url: "/dashboard/admin/teams",
        icon: Shield,
      },
      {
        title: "Active Connections",
        url: "/dashboard/admin/connections",
        icon: Wifi,
      },
      {
        title: "Token Generator",
        url: "/dashboard/admin/tokens",
        icon: Key,
        comingSoon: true,
      },
    ],
  },
];
