import { lusitana } from '@/app/ui/utils/fonts';
import { Car } from 'lucide-react';

const CarLogo = () => {
  return (
    <div className={`${lusitana.className} flex flex-row items-center leading-none text-white`}>
      <Car className="h-12 w-12 pl-2" />
      <p className="text-[44px]">CarR</p>
    </div>
  );
};

export default CarLogo;