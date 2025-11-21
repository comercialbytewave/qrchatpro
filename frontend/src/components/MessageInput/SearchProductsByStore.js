import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import nophoto from "../../assets/nopicture.png";
import {
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
//import { DebouncedInput } from "./DebounceInput";
import useStores from "../../hooks/useStores";
import toastError from "../../errors/toastError";
import DeleteIcon from "@material-ui/icons/Delete";
import api from "../../services/api";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { DebouncedInput } from "./DebouncedInput";
import { Check } from "@material-ui/icons";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 3)
  },
  dialogContent: {
    padding: theme.spacing(2, 3),
    height: "600px"
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: "100%"
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
    backgroundColor: theme.palette.background.paper
  },
  searchResultItem: {
    padding: theme.spacing(1, 2),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      cursor: "pointer"
    }
  },
  orderItemsList: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxHeight: "400px",
    overflowY: "auto"
  },
  orderItem: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius
  },
  quantityControl: {
    display: "flex",
    alignItems: "center"
  },
  quantityText: {
    margin: theme.spacing(0, 1),
    minWidth: 24,
    textAlign: "center"
  },
  tabPanel: {
    padding: theme.spacing(2, 2)
  },
  addressItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1)
  },
  addressHeader: {
    display: "flex",
    alignItems: "center"
  },
  addressLabel: {
    fontWeight: "bold",
    marginLeft: theme.spacing(1)
  },
  addressDetails: {
    marginLeft: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  orderSummary: {
    padding: theme.spacing(2),
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2)
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5)
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    fontWeight: "bold"
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "space-between"
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1)
  },
  sellingPrice: {
    color: theme.palette.success.main
  },
  promotionPrice: {
    textDecoration: "line-through",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem"
  }
}));
// (Todo o import permanece igual até o useStyles)

const SearchProductsByStore = ({ onClose, ticketId }) => {
  const classes = useStyles();
  const { list: listStores } = useStores();
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);

  const [pedido, setPedido] = useState(() => JSON.parse(localStorage.getItem(`pedido_${ticketId}`)) || {});

  const [productSelected, setProductSelected] = useState(undefined);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantity, setQuantity] = useState(1); // ✅ Novo state para quantidade

  const handleStoreChange = event => {
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
        const { data } = await api.get(`/productStores/${store}/search`, {
          params: { searchParam: searchTerm }
        });
        setFilteredProducts(data.productStores || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm, store]);

  const handleSelectProduct = price => {
    console.log(price);

    setProductSelected({
      id: price.id,
      productId: price.productId,
      ean: price.product.ean,
      name: price.product.name,
      description: price.product.description,
      mediaPath: price.product.mediaPath,
      mediaName: price.product.mediaName,
      sellingPrice: price.sellingPrice,
      promotionPrice: price.promotionPrice
    });
    setSearchTerm("");
    setQuantity(1);
  };

  const handleClearProduct = () => {
    setProductSelected(undefined);
    setQuantity(1);
  };

  function  formatWhatsAppMessage(product, isAddToCart) {
    const { id, productId, name, ean, description, sellingPrice, promotionPrice } =
      product;
    const hasPromotion = promotionPrice && promotionPrice !== "0.00";
    
    if ( typeof isAddToCart != 'undefined' && isAddToCart) {
      let completeMessage = typeof isAddToCart != 'undefined' && isAddToCart ? "🛒🛒 => **Este produto foi adicionado ao pedido!**" : ""
      completeMessage = "🛒🛒 => **Este produto foi adicionado ao pedido!**"
      let msg =
        `*${name}*\n`
        
      if (hasPromotion) {
        msg +=
          `*De:* ~R$ ${parseFloat(sellingPrice).toFixed(2)}~\n` +
          `*Por:* R$ ${parseFloat(promotionPrice).toFixed(2)}\n`;
      } else {
        msg += `*Preço:* R$ ${parseFloat(sellingPrice).toFixed(2)}\n`;
      }
      msg+= completeMessage ? `\n\n**${completeMessage}**` : "";
      return msg;
    } else {
     
      let msg =
        `*${name}*\n` +
        `*ID:* ${productId}\n` +
        `*EAN:* ${ean}\n` 
       // `*Qtd:* ${quantity}\n`;
  
      if (hasPromotion) {
        msg +=
          `*De:* ~R$ ${parseFloat(sellingPrice).toFixed(2)}~\n` +
          `*Por:* R$ ${parseFloat(promotionPrice).toFixed(2)}\n`;
      } else {
        msg += `*Preço:* R$ ${parseFloat(sellingPrice).toFixed(2)}\n`;
      }
      msg+= `*Descrição:* ${description}\n`
      
      return msg;
    }
  }

  // Alterado apenas o handleAddToCart para remover uso de cartItems separado

  const handleAddToTicket = async ( isAddToCart) => {
    if (productSelected === undefined) return;
    setLoading(true);

    let blob = null;
    if (productSelected.mediaPath) {
      const mediaUrl = `${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${productSelected.mediaPath}`;
      try {
        const response = await fetch(mediaUrl);
        blob = await response.blob();
      } catch (error) {
        console.error("Erro ao converter imagem para base64:", error);
        toastError("Erro ao carregar imagem");
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    const filename = `product-selected-${new Date().getTime()}.jpg`;
    if (blob) {
      formData.append("medias", blob, filename);
    }
    formData.append("body", formatWhatsAppMessage(productSelected, isAddToCart));
    formData.append("read", "1");
    formData.append("fromMe", true);

    try {
      await api.post(`/messages/${ticketId}`, formData);
      setProductSelected(undefined);
      setQuantity(1);
      setLoading(false);
      onClose();
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (productSelected === undefined) return;

    if (!pedido || !pedido.storeId) {
      toast.error(
        "Pedido ou loja não definida. Selecione uma loja antes de adicionar ao carrinho."
      );
      return;
    }

    setLoading(true);

    const price = Number(
      productSelected.promotionPrice && productSelected.promotionPrice !== "0.00"
        ? productSelected.promotionPrice
        : productSelected.sellingPrice
    );

    const itens = pedido.itens || [];
    const existingIndex = itens.findIndex(
      item => item.productId === productSelected.productId
    );

    let itensAtualizados;

    if (existingIndex !== -1) {
      // produto já no carrinho → soma quantidade e total
      itensAtualizados = itens.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              amount: item.amount + Number(quantity),
              total: (item.amount + Number(quantity)) * price
            }
          : item
      );
      toast.info("🔄 Quantidade atualizada no carrinho");
    } else {
      // produto novo → adiciona ao carrinho
      const newItem = {
        name: productSelected.name,
        price,
        amount: Number(quantity),
        total: Number(quantity) * price,
        productId: productSelected.productId,
        mediaPath: productSelected.mediaPath,
        mediaName: productSelected.mediaName
      };
      itensAtualizados = [...itens, newItem];
      toast.success("🛒 Produto adicionado ao carrinho");
    }

    const pedidoAtualizado = {
      ...pedido,
      ticketId,
      itens: itensAtualizados
    };

    localStorage.setItem(`pedido_${ticketId}`, JSON.stringify(pedidoAtualizado));
    setPedido(pedidoAtualizado);

    await handleAddToTicket(true);
    window.dispatchEvent(new Event("cart-updated"));
    handleClearProduct();
    setLoading(false);
  };


  return (
    <Dialog
      open={true}
      onClose={onClose}
      style={{ height: "600px" }}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className={classes.tabPanel}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="store-label">Loja</InputLabel>
              <Select
                labelId="store-label"
                value={store}
                disabled={stores.length === 1}
                onChange={handleStoreChange}
                label="Loja"
              >
                <MenuItem value="">
                  <em>Selecione uma loja</em>
                </MenuItem>
                {stores.map(store => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl className={classes.formControl}>
              <DebouncedInput
                onChange={val => setSearchTerm(String(val))}
                value={searchTerm}
                disabled={store === "" || productSelected !== undefined}
                placeholder="Digite o nome ou código EAN do produto"
              />
              {searchTerm && filteredProducts.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {filteredProducts.map(prices => (
                    <Paper
                      key={prices.id}
                      onClick={() => handleSelectProduct(prices)}
                      className={classes.searchResultItem}
                      style={{
                        display: "flex",
                        padding: 12,
                        marginBottom: 8,
                        alignItems: "center"
                      }}
                      elevation={1}
                    >
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${prices.product.mediaPath}`}
                        alt=""
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "contain",
                          marginRight: 16,
                          borderRadius: 4,
                          border: "1px solid #eee"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Typography variant="body1">
                          {prices.product.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          EAN: {prices.product.ean}
                        </Typography>
                        {prices.promotionPrice !== "0.00" ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8
                            }}
                          >
                            <Typography
                              variant="body2"
                              className={classes.sellingPrice}
                            >
                              R$ {Number(prices.sellingPrice).toFixed(2)}
                            </Typography>
                            <Typography
                              variant="body1"
                              className={classes.promotionPrice}
                            >
                              R$ {Number(prices.promotionPrice).toFixed(2)}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant="body1">
                            R$ {Number(prices.sellingPrice).toFixed(2)}
                          </Typography>
                        )}
                      </div>
                    </Paper>
                  ))}
                </div>
              )}
            </FormControl>
          </Grid>
        </Grid>

        {productSelected && (
          <Grid
            container
            spacing={1}
            alignItems="center"
            style={{ marginTop: 16 }}
          >
            <Grid item xs={8}>
              <Paper
                className={classes.searchResultItem}
                style={{
                  display: "flex",
                  padding: 10,
                  alignItems: "center",
                  border: "2px solid green"
                }}
                elevation={1}
              >
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${productSelected.mediaPath}`}
                  alt=""
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "contain",
                    marginRight: 16,
                    borderRadius: 4,
                    border: "1px solid #eee"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Typography variant="body1">
                    {productSelected.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    EAN: {productSelected.ean}
                  </Typography>
                  {productSelected.promotionPrice !== "0.00" ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Typography
                        variant="body1"
                        className={classes.sellingPrice}
                      >
                        R$ {Number(productSelected.sellingPrice).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={classes.promotionPrice}
                      >
                        R$ {Number(productSelected.promotionPrice).toFixed(2)}
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">
                      R$ {Number(productSelected.sellingPrice).toFixed(2)}
                    </Typography>
                  )}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Qtd"
                type="number"
                inputProps={{ min: 1 }}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={1}>
              <Button
                variant="text"
                style={{ margin: "auto" }}
                onClick={() => handleAddToCart(true)}
              >
                <Check />
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button
                variant="text"
                style={{ margin: "auto" }}
                onClick={() => handleClearProduct()}
              >
                <DeleteIcon />
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancelar
        </Button>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          disabled={loading || productSelected === undefined}
          className={classes.btnWrapper}
          onClick={() => handleAddToTicket(false)}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchProductsByStore;
