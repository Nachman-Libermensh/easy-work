import {
  Users,
  CreditCard,
  Building,
  FileText,
  Banknote,
  DonutIcon,
  DogIcon,
  DollarSignIcon,
  Menu,
  ActivitySquare,
  StarsIcon,
  Clock10,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: any;
  items?: NavItem[];
  color?: string;
  description?: string;
};

export const navigationConfig: NavItem[] = [
  {
    title: "תורמים",
    href: "/donors",
    icon: Users,
  },
  {
    title: "בית הכנסת",
    icon: StarsIcon,
    items: [
      {
        title: "מתפללים",
        icon: Menu,
        href: "/members",
      },
      {
        title: "זמני תפילות",
        icon: Clock10,
        href: "/schedule",
      },
    ],
  },

  {
    title: "כספים",
    icon: CreditCard,
    items: [
      {
        title: "התחייבויות והוראות קבע",
        href: "/pledges",
        icon: CreditCard,
      },
      {
        title: "הכנסות",
        href: "/transactions",
        icon: Banknote,
      },
      {
        title: "הוצאות",
        href: "/expenses",
        icon: FileText,
      },
      {
        title: "קופת בית הכנסת",
        href: "/kupa",
        icon: ActivitySquare,
      },
    ],
  },
  {
    title: "פרויקטים",
    href: "/projects",
    icon: Building,
  },
  {
    title: "נדרים פלוס",
    icon: "/nedarim-plus.png",
    items: [
      {
        title: "מודול הוראות קבע",
        icon: DogIcon,
        href: "#",
      },
      {
        title: "כספים שהתקבלו",
        icon: DollarSignIcon,
        href: "/nedarim/transactions",
      },
    ],
  },
];
