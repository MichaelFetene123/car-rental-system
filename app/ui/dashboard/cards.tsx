import { lusitana } from "@/app/ui/utils/fonts";

export type CardProps = {
  title: string;
  value: number | string;
  Icon?: React.ElementType;
};

export default function Card({ title, value, Icon }: CardProps) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-md ">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        {/* i removed ${lusitana.className} from h3 */}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl `}
      >
        {value}
      </p>
    </div>
  );
}
