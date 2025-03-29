'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '@/components/Button';
import ReactSignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSave: (data: string) => void;
    selectedColor: string;
}
const SignaturePad = ({ onSave, selectedColor }: SignaturePadProps) => {
    const sigCanvas = useRef<ReactSignatureCanvas | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleClear = () => {
        sigCanvas.current!.clear();
    };

    const handleSave = () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
    
        try {
            const trimmedCanvas = sigCanvas.current.getTrimmedCanvas(); // Ensure this is a function
            if (!trimmedCanvas) {
                console.error("getTrimmedCanvas is not returning a valid canvas.");
                return;
            }
    
            const signatureData = trimmedCanvas.toDataURL("image/png");
            onSave(signatureData);
        } catch (error) {
            console.error("Error while saving signature:", error);
        }
    };

    useEffect(() => {
        if (sigCanvas.current) {
            sigCanvas.current.getTrimmedCanvas = (): HTMLCanvasElement => {
                return sigCanvas.current?.getCanvas() as HTMLCanvasElement;
            };
        }
    }, []);


    return (
        <div className="flex flex-col items-center p-4 bg-white shadow-lg rounded-md">
            <SignatureCanvas
                ref={sigCanvas}
                penColor={selectedColor||'black'}
                canvasProps={{ className: 'border rounded-md w-full h-40' }}
                onBegin={() => setIsDrawing(true)}
                onEnd={() => setIsDrawing(false)}
            />
            <div className="flex gap-4 mt-2">
                <Button onClick={handleClear}>
                    Clear
                </Button>
                <Button onClick={handleSave} disabled={isDrawing}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default SignaturePad;
