import { useState, type ReactNode } from "react";
import Toast from 'react-bootstrap/Toast';
import ToastContainer, { type ToastPosition } from 'react-bootstrap/ToastContainer';
import { SubmitButton } from "./SubmitButton";
import { createPortal } from "react-dom";

interface SubmitButtonAddToastProps {
    header: string;
    buttonClassName?: string;
    buttonMsg: string,
    toastClassName?: string;
    position: ToastPosition;
    containerElement: Element | null;
    delay?: number;
    onClick: () => Promise<{ success: boolean, msg: string}>;
    // minsAgo: number;
}

interface ToastItem {
    id: number;
    success: boolean;
    show: boolean;
    body: ReactNode;
}

// function timeMsg(mins: number): string {
//     if(mins > 60){
//         const hours = Math.floor(mins / 60);
//         return `${hours} hour${hours > 1 ? "s" : ""} ago`;    
//     }
//     else if(mins > 0) {
//         return `${mins} min${mins > 1 ? "s" : ""} ago`;
//     }
//     return "now";
// }

const SubmitButtonAddToast = ({
    header,
    buttonClassName="",
    buttonMsg,
    toastClassName="",
    position,
    containerElement,
    delay=5000,
    onClick,
    // minsAgo=0,
}: SubmitButtonAddToastProps) =>  {
    const [nextId, setNextId] = useState<number>(0);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const icon = (success: boolean) => {
        return success ? 'bi-check-circle-fill' : 'bi-exclamation-diamond-fill';
    };

    const color = (success:boolean) => {
        return success ? '#38977eff' : '#ff4f4fff';
    }

    const handleClick = async () => {
        const res = await onClick();

        const newToast: ToastItem = {
            id: nextId,
            success: res.success,
            show: false,
            body: res.msg
        };

        setToasts(prev => [...prev, newToast]);
        setNextId(prev => prev + 1);
        
        setTimeout(() => {
            setToasts(prev => prev.map(t => 
                t.id === newToast.id ? { ...t, show: true } : t
            ));
        }, 10); 
    };

    const handleClose = (toast: ToastItem) => {
        setToasts(prev => prev.map(t => 
            t.id === toast.id ? { ...t, show: false } : t
        ));

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 300);
    }

    return (
        <>
            <SubmitButton 
                onClick={handleClick}
                defaultMsg={buttonMsg}
                className={buttonClassName}
            />
            {containerElement && createPortal(
            <ToastContainer position={position} className="p-3" style={{ zIndex: 10000 }}>
                {toasts.map((toast) => (
                    <Toast 
                        key={toast.id}
                        show={toast.show} 
                        onClose={() => handleClose(toast)} 
                        delay={delay} 
                        autohide={delay !== 0} 
                        className={toastClassName}
                    >
                        <Toast.Header className={`gap-2`}>
                            <i className={`bi ${icon(toast.success)}`} style={{ color: `${color(toast.success)}` }}></i>
                            <strong className="me-auto" style={{ color: `${color(toast.success)}` }}>{header}</strong>
                        </Toast.Header>
                        <Toast.Body style={{ color: `${color(toast.success)}`}}>{toast.body}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>,
            containerElement
            )}
        </>
    )
};

export default SubmitButtonAddToast;