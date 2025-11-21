import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

interface ConsumptionMethodOptionProps {
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  option: any;
}

export const ConsumptionMethodOption = ({
  imageAlt,
  imageUrl,
  buttonText,
}: ConsumptionMethodOptionProps) => {
  return (
    <Card className="border-none flex flex-col gap-2 shadow-none">
      <CardContent className="relative flex-col items-center gap-8" >
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={120}
          height={120}
          className="object-contain"
          unoptimized
        />
      </CardContent>
      <span className="font-semibold">
        {buttonText}
      </span>
    </Card>
  );
};


