import { lusitana } from "@/app/ui/utils/fonts";
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/ui/card";

export type CardProps = {
  title: string;
  value: number | string;
  Icon?: React.ElementType;
  tone?: "blue" | "emerald" | "amber" | "rose";
};

const toneStyles = {
  blue: {
    card: "bg-blue-50 border-blue-100",
    title: "text-blue-800",
    icon: "text-blue-700",
    content: "text-blue-900",
    value: "text-blue-900",
  },
  emerald: {
    card: "bg-emerald-50 border-emerald-100",
    title: "text-emerald-800",
    icon: "text-emerald-700",
    content: "text-emerald-900",
    value: "text-emerald-900",
  },
  amber: {
    card: "bg-amber-50 border-amber-100",
    title: "text-amber-800",
    icon: "text-amber-700",
    content: "text-amber-900",
    value: "text-amber-900",
  },
  rose: {
    card: "bg-rose-50 border-rose-100",
    title: "text-rose-800",
    icon: "text-rose-700",
    content: "text-rose-900",
    value: "text-rose-900",
  },
} as const;

export default function Card({ title, value, Icon, tone = "blue" }: CardProps) {
  const styles = toneStyles[tone];

  return (
    <UiCard className={`h-full  ${styles.card}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${styles.title}`}>
          {title}
        </CardTitle>
        {Icon ? <Icon className={`size-4 ${styles.icon}`} /> : null}
      </CardHeader>
      <CardContent className={styles.content}>
        <div
          className={`${lusitana.className} text-2xl font-bold ${styles.value}`}
        >
          {value}
        </div>
      </CardContent>
    </UiCard>
  );
}
