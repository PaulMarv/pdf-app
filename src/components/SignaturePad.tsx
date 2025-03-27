'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '@/components/Button';

const SignaturePad = ({ onSave }: { onSave: (data: string) => void }) => {
    const sigCanvas = useRef<SignatureCanvas | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleClear = () => {
        sigCanvas.current!.clear();
    };

    const handleSave = () => {
        if (sigCanvas.current!.isEmpty()) return;
        const signatureData = sigCanvas.current?.getTrimmedCanvas()?.toDataURL('image/png') || '';
        onSave(signatureData);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-white shadow-lg rounded-md">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: 'border rounded-md w-full h-40' }}
                onBegin={() => setIsDrawing(true)}
                onEnd={() => setIsDrawing(false)}
            />
            <div className="flex gap-4 mt-2">
                <Button onClick={handleClear}>
                    Clear
                </Button>
                <Button onClick={handleSave} disabled={!isDrawing}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default SignaturePad;
