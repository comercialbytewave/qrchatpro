// src/components/StoreClientModal.jsx

import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  makeStyles,
  FormControl,
  InputLabel,
  Select
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  btnWrapper: { position: "relative" },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
    width: "100%"
  }
}));

const StoreSchema = Yup.object().shape({
  storeId: Yup.string().required("Selecione uma loja")
});

const StoreClientModal = ({ open, onClose, ticket, onComplete }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [defaultStoreId, setDefaultStoreId] = useState("");
  const customerId = ticket?.contact?.id;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/stores/list");
        setStores(data);
        if (data.length === 1) {
          setDefaultStoreId(data[0].id);
        }
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleSubmit = async (values, actions) => {
    try {
      const { data } = await api.get(`/contacts/${ticket?.contact.id}`);

      if (!data.customerId) {
        onClose();
        toastError("Cliente não cadastrado ou não identificado.");
        return;
      }

      const selectedStore = stores.find(s => s.id === values.storeId);
      const pedido = {
        storeId: selectedStore?.id,
        storeName: selectedStore?.name,
        customerId: data.customerId,
        customerDocument: data?.document,
        customerName: data?.name,
        customerPhone: ticket.contact?.number,
        customerEmail: data?.email,
        sellerId: user.id,
        ticketId: ticket.id,
        itens: []
      };

      localStorage.setItem("pedido_" + ticket.id, JSON.stringify(pedido));
      onComplete(pedido);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Selecionar Loja e Cliente</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={{ storeId: defaultStoreId || "" }}
        validationSchema={StoreSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting, values, handleChange }) => (
          <Form>
            <DialogContent>
              <FormControl className={classes.formControl} variant="outlined">
                <InputLabel id="store-select-label">Loja</InputLabel>
                <Field
                  as={Select}
                  labelId="store-select-label"
                  id="storeId"
                  name="storeId"
                  label="Loja"
                  value={values.storeId}
                  onChange={handleChange}
                  error={touched.storeId && Boolean(errors.storeId)}
                  disabled={stores.length === 1} // 🔹 bloqueia edição
                >
                  {stores.length > 0 ? (
                    stores.map(store => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={""}>Nenhuma loja cadastrada</MenuItem>
                  )}
                </Field>
              </FormControl>

              <TextField
                label="Cliente"
                value={ticket.contact?.name || ""}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={onClose}
                color="secondary"
                variant="outlined"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <div className={classes.btnWrapper}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={!values.storeId || isSubmitting}
                >
                  Salvar
                </Button>
                {isSubmitting && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default StoreClientModal;
