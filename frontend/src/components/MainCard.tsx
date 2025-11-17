import type { ReactNode } from "react";

interface MainCardProps {
    children: ReactNode;
    className?: string;
}

export const MainCard = ({ children, className='' }: MainCardProps) => {
    return (
        <div className={`container-fluid d-flex flex-column justify-content-center align-items-center h-100 ${className}`}>
            <div className="main-container card shadow-lg p-4 d-flex flex-column justify-content-center align-items-center">
                {children}
            </div>
        </div>
    );
};

