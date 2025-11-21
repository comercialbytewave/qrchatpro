// src/components/CartDrawer.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Drawer,
  IconButton,
  Typography,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Box
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import CheckoutModal from "../CheckoutModal";
import { AuthContext } from "../../context/Auth/AuthContext";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "4px 0 0 4px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.contactdrawer
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.contactdrawer
  },
  footer: {
    padding: theme.spacing(2),
    borderTop: "1px solid #ddd"
  },
  avatar: {
    width: 48,
    height: 48
  },
  emptyText: {
    textAlign: "center",
    marginTop: theme.spacing(4)
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  deleteButton: {
    marginLeft: theme.spacing(1)
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5)
  }
}));

const CartDrawer = ({ open, onClose, ticketId, onCheckout }) => {
  const classes = useStyles();
  const [pedido, setPedido] = useState({});
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const cartItems = pedido?.itens || [];

  const carregarPedido = useCallback(() => {
    const stored = localStorage.getItem(`pedido_${ticketId}`);
    setPedido(stored ? JSON.parse(stored) : {});
  }, [open,ticketId]);

  const persistPedido = (novoPedido) => {
    localStorage.setItem(`pedido_${ticketId}`, JSON.stringify(novoPedido));
    setPedido(novoPedido);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const updateQty = (index, delta) => {
    const updatedCart = [...cartItems];
    updatedCart[index].amount += delta;
    if (updatedCart[index].amount <= 0) updatedCart.splice(index, 1);
    persistPedido({ ...pedido, itens: updatedCart });
  };

  const removeItem = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    persistPedido({ ...pedido, itens: updatedCart });
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.amount, 0);

  const finishPedido = () => {
    setCheckoutModalOpen(true)
    onClose();
  };

  useEffect(() => {
    carregarPedido();

    const sync = () => carregarPedido();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [carregarPedido]);

  return (
    <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        PaperProps={{ style: { position: "absolute" } }}
        BackdropProps={{ style: { position: "absolute" } }}
        ModalProps={{
          container: document.getElementById("drawer-container"),
          style: { position: "absolute" }
        }}
        classes={{
          paper: classes.drawerPaper
        }}
        style={{ zIndex: 1400 }}
      >
    
      <CheckoutModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        pedido={pedido}
        onConfirm={(pedidoFinalizado) => {
          onCheckout(pedidoFinalizado);
          setCheckoutModalOpen(false);
        }}
      />

      <div className={classes.header}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" style={{ marginLeft: 8 }}>
          Carrinho de Compras
        </Typography>
      </div>

      <div className={classes.content}>
        {cartItems.length === 0 ? (
          <Typography variant="body1" className={classes.emptyText}>
            Seu carrinho está vazio.
          </Typography>
        ) : (
          <List>
            {cartItems.map((item, index) => (
              <ListItem
                key={index}
                className={classes.listItem}
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Avatar
                    src={`${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${item.mediaPath}`}
                    className={classes.avatar}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box className={classes.qtyControl}>
                      <IconButton
                        size="small"
                        onClick={() => updateQty(index, -1)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{item.amount}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQty(index, 1)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        R$ {item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  edge="end"
                  size="small"
                  className={classes.deleteButton}
                  onClick={() => removeItem(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </div>

      <div className={classes.footer}>
        <Divider style={{ marginBottom: 8 }} />
        <Typography variant="subtitle1">
          Total: R$ {total.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={cartItems.length === 0}
          onClick={finishPedido}
        >
          Finalizar Compra
        </Button>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
