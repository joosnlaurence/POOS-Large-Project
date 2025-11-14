import type { ReactNode } from "react";

interface MainCardProps {
    children: ReactNode;
}

export const MainCard = ({ children }: MainCardProps) => {
    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100">
            <div className="main-container card shadow-lg p-4 mx-auto">
                {children}
            </div>
        </div>
    );
};

