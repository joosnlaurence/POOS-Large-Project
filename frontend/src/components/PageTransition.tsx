import type { ReactNode } from "react";
import '../scss/PageTransition.scss';

interface PageTransitionProps {
    children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <div className="page-transition flex-grow-1">
            {children}
        </div>
    );
};

