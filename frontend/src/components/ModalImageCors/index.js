import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
    messageMedia: {
        objectFit: "cover",
        width: 250,
        height: "auto",
        borderRadius: 8, // Simplificado para aplicar em todos os cantos
    }
}));

const ModalImageCors = ({ imageUrl }) => {
    const classes = useStyles();
    const [fetching, setFetching] = useState(true);
    const [blobUrl, setBlobUrl] = useState("");

    useEffect(() => {
        // 1. Verifica se a URL existe e se não é apenas uma string vazia
        if (!imageUrl || typeof imageUrl !== 'string') return;

        let isMounted = true;
        const fetchImage = async () => {
            try {
                const { data, headers } = await api.get(imageUrl, {
                    responseType: "blob",
                });

                if (isMounted) {
                    const url = window.URL.createObjectURL(
                        new Blob([data], { type: headers["content-type"] })
                    );
                    setBlobUrl(url);
                    setFetching(false);
                }
            } catch (error) {
                console.error("Erro ao carregar imagem via CORS:", error);
                // Em caso de erro, desativa o loading para tentar carregar a original (fallback)
                setFetching(false);
            }
        };

        fetchImage();

        // 2. Função de limpeza para evitar vazamento de memória e erros de estado
        return () => {
            isMounted = false;
            if (blobUrl) window.URL.revokeObjectURL(blobUrl);
        };
    }, [imageUrl]);

    // 3. Fallback visual enquanto carrega ou se der erro
    const displayUrl = fetching ? imageUrl : (blobUrl || imageUrl);

    return (
        <ModalImage
            className={classes.messageMedia}
            small={displayUrl} // Note: ModalImage usa 'small', não 'smallSrcSet' para URL direta
            medium={displayUrl}
            large={displayUrl}
            alt="image"
            showRotate={true}
        />
    );
};

export default ModalImageCors;