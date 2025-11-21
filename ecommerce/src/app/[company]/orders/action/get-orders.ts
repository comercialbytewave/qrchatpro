"use server";

export const fetchOrders = async (phonr: string) => {
  try {
    const res = await fetch(`http://localhost:3333/order?phonr=${phonr}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Garante que os dados sempre sejam atualizados
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    const data = await res.json();
    return { success: true, orders: data };
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, orders: [] };
  }
};

