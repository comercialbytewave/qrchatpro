import React, { useState } from "react";
import api from "../../services/api";
import Button from "@material-ui/core/Button";

const packageVersion = require("../../../package.json").version;

const VersionControl = () => {
  const [storedVersion] = useState(window.localStorage.getItem("version") || "0.0.0");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateVersion = async () => {
    // Evitar cliques duplos
    if (isUpdating) {
      console.log("[VersionControl] Já está atualizando, ignorando clique");
      return;
    }

    setIsUpdating(true);
    console.log("[VersionControl] === INÍCIO DA ATUALIZAÇÃO ===");
    console.log("[VersionControl] Versão atual:", storedVersion);
    console.log("[VersionControl] Nova versão:", packageVersion);

    try {
      // Passo 1: Salvar versão no localStorage
      console.log("[VersionControl] Passo 1: Salvando no localStorage...");
      window.localStorage.setItem("version", packageVersion);
      console.log("[VersionControl] Passo 1: OK");

      // Passo 2: Salvar no banco (opcional)
      console.log("[VersionControl] Passo 2: Salvando no banco...");
      try {
        const response = await api.post("/version", { version: packageVersion });
        console.log("[VersionControl] Passo 2: OK - Resposta:", response.data);
      } catch (apiError) {
        console.error("[VersionControl] Passo 2: ERRO na API (continuando):", apiError.message);
      }

      // Passo 3: Limpar localStorage adicional
      console.log("[VersionControl] Passo 3: Limpando frontendVersion...");
      window.localStorage.removeItem("frontendVersion");
      console.log("[VersionControl] Passo 3: OK");

      // Passo 4: Redirecionar
      console.log("[VersionControl] Passo 4: Preparando redirecionamento...");
      const newUrl = window.location.origin + "/?updated=" + Date.now();
      console.log("[VersionControl] Passo 4: Redirecionando para:", newUrl);

      // Usar timeout para garantir que os logs apareçam
      setTimeout(() => {
        console.log("[VersionControl] Executando redirecionamento...");
        window.location.href = newUrl;
      }, 100);

    } catch (error) {
      console.error("[VersionControl] ERRO GERAL:", error);
      setIsUpdating(false);
      alert("Erro ao atualizar: " + error.message);
    }
  };

  // Log ao renderizar
  console.log("[VersionControl] Renderizando - stored:", storedVersion, "package:", packageVersion, "mostrar botão:", storedVersion !== packageVersion);

  return (
    <div>
      {storedVersion !== packageVersion && (
        <Button
          variant="contained"
          size="small"
          disabled={isUpdating}
          style={{
            backgroundColor: isUpdating ? "gray" : "red",
            color: "white",
            fontWeight: "bold",
            right: "15px",
          }}
          onClick={handleUpdateVersion}
        >
          {isUpdating ? "Atualizando..." : "Nova versão disponível! Clique aqui para atualizar"}
        </Button>
      )}
    </div>
  );
};

export default VersionControl;
