
'use client'
import Image from "next/image";
import { ConsumptionMethodOption } from "./components/consumption-method-option-mock";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { DialogSelectStore } from "@/components/dialog-stores";
import { normalizeImage } from "@/helpers/helpers";
import logoInfarma from '../../../public/logo.png'
import logoWhite from '../../../public/logo-white.png'
import { useSelectStore } from "@/components/select/useSelectStore";
import { useEffect } from "react";
import { useTheme } from "next-themes";

import takeAway from '../../../public/takeaway.png';
import dineIn from '../../../public/dine_in.png';

const BranchPage = () => {

  const { companyStore } = useCompanytStore()
  const { clearSelection } = useSelectStore()


  useEffect(() => {
    clearSelection()
  }, [])

  const { theme } = useTheme()

  const logo = theme === 'dark' ? logoWhite : logoInfarma


  return (
    <div className="flex h-screen flex-col items-center justify-center px-6 pt-24">
      <div className="flex flex-col items-center gap-2">
        <Image
          src={companyStore?.mediaPath ? normalizeImage(companyStore?.mediaPath, companyStore?.id) : logo}
          alt={'logo'}
          width={160}
          height={160}
          unoptimized
        />
        <h2 className="font-semibold">{companyStore?.name}</h2>
      </div>
      <div className="space-y-2 pt-24 text-center">
        <h3 className="text-2xl font-semibold">Seja bem-vindo!</h3>
        <p className="opacity-55">
          Escolha como prefere receber seus produtos.
        </p>
        <p className="opacity-55">
          Estamos aqui para oferecer praticidade e rapidez na sua entrega.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-14">
        <DialogSelectStore
          method="COLLECT_AT_PHARMACY"
        >
          <ConsumptionMethodOption
            option="COLLECT_AT_PHARMACY"
            buttonText="Retirada Em Loja"
            imageAlt="Retirada Em Loja"
            imageUrl={dineIn.src}
          />
        </DialogSelectStore>
        <DialogSelectStore
          method="RECEIVE_AT_HOME"
        >
          <ConsumptionMethodOption
            option="RECEIVE_AT_HOME"
            buttonText="Receba Em Casa"
            imageAlt="Receba Em Casa"
            imageUrl={takeAway.src}
/>
        </DialogSelectStore>
      </div>
    </div>
  );
};

export default BranchPage;
