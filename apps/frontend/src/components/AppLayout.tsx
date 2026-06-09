import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
