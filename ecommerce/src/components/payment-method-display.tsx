import { Wallet, CreditCard, Landmark, QrCode, HelpCircle } from 'lucide-react';
import React from 'react';

// Tipos de pagamento suportados
type PaymentMethod = 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Debito' | 'PIX' | string;

interface PaymentMethodDisplayProps {
    method: PaymentMethod;
    className?: string;
    iconSize?: number;
    textClassName?: string;
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
    method,
    className = '',
    iconSize = 16,
    textClassName = ''
}) => {
    // Mapeamento dos ícones
    const getPaymentIcon = () => {
        const iconStyle = { width: iconSize, height: iconSize };

        switch (method.toUpperCase()) {
            case 'DINHEIRO':
                return <Wallet style={iconStyle} />;
            case 'CARTÃO DE CRÉDITO':
                return <CreditCard style={iconStyle} />;
            case 'CARTÃO DE DÉBITO':
                return <Landmark style={iconStyle} />;
            case 'PIX':
                return <QrCode style={iconStyle} />;
            default:
                return <HelpCircle style={iconStyle} />;
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className={textClassName}>{method}</span>
            {getPaymentIcon()}
        </div>
    );
};

export default PaymentMethodDisplay;