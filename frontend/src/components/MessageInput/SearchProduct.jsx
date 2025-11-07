import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import nophoto from "../../assets/nophoto.jpg";
import Grid from "@material-ui/core/Grid";
import { DebouncedInput } from "../OrderPanel/DebounceInput";
import useStores from "../../hooks/useStores";
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@material-ui/core";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DebounceInputSearchStore } from "../MessageInputCustom/DebounceInputSearchStore";
import CustomStoreSelect from "./SelectStore";
import { Send } from "@material-ui/icons";
import TableRowSkeleton from "../TableRowSkeleton";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 3),
  },
  dialogContent: {
    padding: theme.spacing(2, 3),
    height: "600px",
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: "100%",
  },
  searchResults: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    maxHeight: 300,
    overflow: "auto",
    marginTop: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  searchResultItem: {
    padding: theme.spacing(1, 2),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      cursor: "pointer",
    },
  },
  orderItemsList: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxHeight: "400px",
    overflowY: "auto",
  },
  orderItem: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
  },
  quantityText: {
    margin: theme.spacing(0, 1),
    minWidth: 24,
    textAlign: "center",
  },
  tabPanel: {
    padding: theme.spacing(2, 2),
  },
  addressItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
  addressHeader: {
    display: "flex",
    alignItems: "center",
  },
  addressLabel: {
    fontWeight: "bold",
    marginLeft: theme.spacing(1),
  },
  addressDetails: {
    marginLeft: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  orderSummary: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    fontWeight: "bold",
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "space-between",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  sellingPrice: {
    color: theme.palette.success.main,
  },
  promotionPrice: {
    textDecoration: "line-through",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
}));

const SearchProduct = ({ ticketId }) => {
  const classes = useStyles();
  const { list: listStores } = useStores();
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  const [productSelected, setProductSelected] = useState(undefined);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const handleStoreChange = (event) => {
    setStore(event.target.value);
    setProductSelected(undefined);
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const list = await listStores();
        if (list.length === 1) {
          setStore(list[0].id);
        }
        setStores(list);
      } catch (err) {
        toastError(err);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (!store || !searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/products/list/full?storeId=${store}&pageSize=50&pageNumber=1&searchParam=${encodeURIComponent(searchTerm)}`
        );
        setFilteredProducts(response?.data?.data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm, store]);

  const normalizeImage = (image) => {
    if (!image) {
      return nophoto;
    }
    return `data:image/png;base64,${image}`;
  };

  function formatWhatsAppMessage(product) {
    const { code, name, description, ean, sellingPrice, promotionPrice } = product;

    const hasPromotion = promotionPrice && promotionPrice !== "0.00";

    if (hasPromotion) {
      return (
        `🏷️ *${name}*\n` +
        `*Código:* ${code} | *EAN:* ${ean}\n` +
        `*Descrição:* ${description}\n` +
        `*De:* ~R$ ${parseFloat(sellingPrice).toFixed(2)}~ - *Por:* R$ ${parseFloat(promotionPrice).toFixed(2)}\n` +
        `🎉 *Economia de:* R$ ${(parseFloat(sellingPrice)-parseFloat(promotionPrice)).toFixed(2)}`
      );
    } else {
      return (
        `🛍️ *${name}*\n` +
        `*Código:* ${code} | *EAN:* ${ean}\n` +
        `*Descrição:* ${description}\n` +
        `*Preço:* R$ ${parseFloat(sellingPrice).toFixed(2)}`
      );
    }
  }

  function base64ToFile(base64DataInput, filename) {
    const base64Data = normalizeImage(base64DataInput);
    const [metadata, base64String] = base64Data.split(",");
    const mimeMatch = metadata.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], filename, { type: mimeType });
  }

  const handleAddToTicket = async (product) => {
    setLoading(true);

    let file = null;
    const formData = new FormData();
    if (product.media) {
      file = base64ToFile(product.media, "imagem.jpg");
    }
    formData.append("body", formatWhatsAppMessage(product));
    formData.append("read", "1");
    formData.append("fromMe", "true");

    try {
      if (file !== null) {
        formData.append("medias", file);
      }
      await api.post(`/messages/${ticketId}`, formData);

      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", maxWidth: "100%", padding: 20 }}>
      <Grid container spacing={1}>
        <div style={{ display: "flex", width: "100%" }}>
          <FormControl variant='outlined' className={classes.formControl}>
            <label htmlFor='store-select'>Loja</label>
            <CustomStoreSelect stores={stores} store={store} setStore={handleStoreChange} />
          </FormControl>
        </div>

        <div style={{ display: "flex", width: "100%" }}>
          <FormControl className={classes.formControl}>
            <label htmlFor='search-product'>Buscar</label>
            <DebounceInputSearchStore
              onChange={(val) => setSearchTerm(String(val))}
              value={searchTerm}
              disabled={store === "" || productSelected !== undefined}
              placeholder='Digite o nome ou código EAN do produto'
            />
            {loading ? (
              <TableRowSkeleton columns={4} />
            ) : (
              searchTerm &&
              filteredProducts.length > 0 && (
                <div
                  style={{ marginTop: 8, display: "flex", flexDirection: "column", minHeight: "200px", maxHeight: "220px", overflowY: "auto" }}
                >
                  {filteredProducts.map((product) => (
                    <Paper
                      key={product.id}
                      className={classes.searchResultItem}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginBottom: 2,
                      }}
                      elevation={1}
                    >
                      <img
                        src={normalizeImage(product.media)}
                        alt=''
                        style={{
                          width: 25,
                          height: 25,
                          objectFit: "contain",
                          marginRight: 16,
                          borderRadius: 4,
                          border: "1px solid #eee",
                        }}
                      />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant='caption'>{product.name}</Typography>
                        <Typography variant='caption' color='textSecondary'>
                          Código: {product.code} | EAN: {product.ean}
                        </Typography>
                        {product.promotionPrice !== "0.00" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Typography variant='caption' className={classes.promotionPrice}>
                              R$ {Number(product.sellingPrice).toFixed(2)}
                            </Typography>
                            <Typography variant='caption' className={classes.sellingPrice} >
                              R$ {Number(product.promotionPrice).toFixed(2)}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant='caption'>R$ {Number(product.sellingPrice).toFixed(2)}</Typography>
                        )}
                      </div>
                      <Button onClick={() => handleAddToTicket(product)}>
                        <Send height={8} color='primary' />
                      </Button>
                    </Paper>
                  ))}
                </div>
              )
            )}
          </FormControl>
        </div>
      </Grid>
    </div>
  );
};

export default SearchProduct;
