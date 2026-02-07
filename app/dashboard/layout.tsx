import { PropsWithChildren } from "react";
import Sidenav from '@/app/ui/dashboard/sidenav'

const DashboardLayout = ({ children }: PropsWithChildren ) => {
  return <div className='flex flex-col h-screen md:flex-row md:overflow-hidden'>
    <div className="w-full md:w-72"><Sidenav/></div>
    <div className="w-full grow overflow-y-auto p-6 md:p-12">{children}</div>
  </div>
};

export default DashboardLayout;
