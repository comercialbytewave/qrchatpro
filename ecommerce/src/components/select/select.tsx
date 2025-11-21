'use client'


import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useSelectStore } from "./useSelectStore"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Store } from "@/data/store/interfaces/store"

interface Option {
    label: string
    value: string
}


export function InputSelectStores() {

    const { selectedStore, setSelectedStore } = useSelectStore();

    const [storeOptions, setStoreOptions] = useState<Option[]>([])
    const [stores, setStores] = useState<Store[]>([])

    useEffect(() => {
        const getStores = async () => {
            await api.get('/api/ecommerce/stores/list').then(res => {
                const { data } = res
                if (data.stores.length > 0) {
                    setStores(data.stores)
                    const storesTemp = data.stores.map((item: any) => {
                        return {
                            label: item.name,
                            value: item.id
                        }
                    })
                    if (storesTemp.length === 1) {
                        setSelectedStore(data.stores[0])
                    }
                    setStoreOptions(storesTemp)
                }
            })
        }

        getStores()
    }, [])

    const handleSelectStore = (e: any) => {
        const storeTemp = stores.find(store => store.id === e) as Store
        setSelectedStore(storeTemp)
    }

    return (
        <Select
            disabled={stores.length === 1}
            onValueChange={handleSelectStore}
            value={selectedStore?.id}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder='Selecione a loja' />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {storeOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
