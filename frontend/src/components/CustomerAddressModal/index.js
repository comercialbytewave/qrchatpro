// ✅ Corrigido: botão submit agora envia os dados corretamente
// ✅ Corrigido: `onSubmit` do Formik agora chama `handleSubmit` diretamente

import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
  FormControlLabel,
  Switch
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import TableRowSkeleton from "../TableRowSkeleton";
import EditIcon from "@material-ui/icons/Edit";
import { Cancel, CheckCircle, Search } from "@material-ui/icons";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";

const useStyles = makeStyles(theme => ({
  root: { display: "flex", flexWrap: "wrap" },
  btnWrapper: { position: "relative" },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  tabPanelsContainer: {
    padding: theme.spacing(2)
  },
  multFieldLine: {
    display: "flex",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  textField: {
    marginBottom: theme.spacing(1)
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const contactAddressSchema = Yup.object().shape({
  name: Yup.string().required("Tipo é obrigatório"),
  zipCode: Yup.string().required("Cep é obrigatório"),
  address: Yup.string().required("Endereço é obrigatório"),
  city: Yup.string().required("Cidade é obrigatório"),
  neighborhood: Yup.string().required("Cidade é obrigatório"),
  number: Yup.string().required("Cidade é obrigatório"),
  state: Yup.string().required("UF é obrigatório")
});

const CustomerAddressModal = ({ open, onClose, customerId }) => {
  const classes = useStyles();
  const { user: loggedInUser } = useContext(AuthContext);
  const [customersAddress, setCustomersAddress] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialState = {
    name: "",
    zipCode: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    neighborhood: "",
    latitude: 0,
    longitude: 0,
    isActive: false
  };
  const [customerAddress, setCustomerAddress] = useState(initialState);

  const removeMask = value => value.replace(/[^0-9,]/g, "").replace(",", ".");

  useEffect(() => {
    if (!customerId) return;
    const fetchCustomerAddressStore = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/customers/address/all/${customerId}`);
        setCustomersAddress(data.customerAddress);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerAddressStore();
    setCustomerAddress(initialState);
  }, [customerId, open]);

  /*const handleSearchZipCode = async (zipCode, setFieldValue) => {
    if (!zipCode || zipCode.length < 8) return;
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${zipCode.replace(/\D/g, "")}/json/`
      );
      const data = await response.json();
      if (!data.erro) {
        setFieldValue("address", data.logradouro || "");
        setFieldValue("neighborhood", data.bairro || "");
        setFieldValue("city", data.localidade || "");
        setFieldValue("state", data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  };*/

  const handleSearchZipCode = async (zipCode, setFieldValue) => {
    if (!zipCode || zipCode.length < 8) return;
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${zipCode.replace(/\D/g, "")}`
      );
      const data = await response.json();
      if (!data.erro) {
        setFieldValue("address", data.street || "");
        setFieldValue("neighborhood", data.neighborhood || "");
        setFieldValue("city", data.city || "");
        setFieldValue("state", data.state || "");
        setFieldValue("longitude", data.location?.coordinates?.longitude || "0");
        setFieldValue("latitude", data.location?.coordinates?.latitude || "0");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  };

 

  const handleClose = () => {
    setCustomerAddress([]);
    onClose();
  };

  const handleEditContactAddress = async customerAddressId => {
    try {
      const { data } = await api.get(`/customers/Address/${customerAddressId}`);
      setCustomerAddress(data);
      setEditingId(customerAddressId);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteContactAddress = async customerAddressId => {
    try {
      await api.delete(`/customers/Address/${customerAddressId}`);
      toast.success(i18n.t("customerAddress.toasts.deleted"));
      const { data } = await api.get(`/customers/Address/all/${customerId}`);
      setCustomersAddress(data.customerAddress);
      setCustomerAddress(initialState);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSubmit = async (values, actions) => {
    try {
      const contactAddressData = {
        ...values,
        zipCode: removeMask(values.zipCode),
        customerId
      };
      if (editingId) {
        await api.put(`/customers/Address/${editingId}`, contactAddressData);
        toast.success("Endereço atualizado com sucesso!");
      } else {
        await api.post("/customers/Address", contactAddressData);
        toast.success("Endereço adicionado com sucesso!");
      }
      const { data } = await api.get(`/customers/Address/all/${customerId}`);
      setCustomersAddress(data.customerAddress);
      setEditingId(null);
      setCustomerAddress(initialState);
      actions.resetForm();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Endereço do Cliente</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={customerAddress}
        validationSchema={contactAddressSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <div className={classes.multFieldLine}>
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  onChange={e =>
                    setCustomerAddress(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                />
                <FormControlLabel
                  control={
                    <Field
                      as={Switch}
                      color="primary"
                      name="isActive"
                      checked={values.isActive}
                    />
                  }
                  label={i18n.t("customerAddressModal.form.isActive")}
                />
              </div>
              <div className={classes.multFieldLine}>
                <Field name="zipCode">
                  {({ field, form }) => (
                    <InputMask
                      {...field}
                      mask="99999-999"
                      maskChar="_"
                      value={field.value}
                      onChange={e =>
                        form.setFieldValue("zipCode", e.target.value)
                      }
                    >
                      {inputProps => (
                        <TextField
                          {...inputProps}
                          label="CEP"
                          variant="outlined"
                          margin="dense"
                          error={touched.zipCode && Boolean(errors.zipCode)}
                          helperText={touched.zipCode && errors.zipCode}
                        />
                      )}
                    </InputMask>
                  )}
                </Field>
                <IconButton
                  variant="contained"
                  color="primary"
                  aria-label="add to shopping cart"
                  onClick={() =>
                    handleSearchZipCode(values.zipCode, setFieldValue)
                  }
                >
                  <Search />
                </IconButton>
              </div>
              <div className={classes.multFieldLine}>
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.address")}
                  name="address"
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  variant="outlined"
                  margin="dense"
                  style={{ width: "75%" }}
                  maxLength={250}
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.number")}
                  name="number"
                  error={touched.number && Boolean(errors.number)}
                  helperText={touched.number && errors.number}
                  variant="outlined"
                  margin="dense"
                  maxLength={30}
                  style={{ width: "25%" }}
                  className={classes.textField}
                />
              </div>
              <Field
                as={TextField}
                label={i18n.t("customerAddressModal.form.complement")}
                name="complement"
                maxLength={255}
                error={touched.complement && Boolean(errors.complement)}
                helperText={touched.complement && errors.complement}
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
              />
              <div className={classes.multFieldLine}>
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.neighborhood")}
                  name="neighborhood"
                  error={touched.neighborhood && Boolean(errors.neighborhood)}
                  helperText={touched.neighborhood && errors.neighborhood}
                  variant="outlined"
                  margin="dense"
                  maxLength={150}
                  style={{ width: "40%" }}
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.city")}
                  name="city"
                  error={touched.city && Boolean(errors.city)}
                  helperText={touched.city && errors.city}
                  variant="outlined"
                  margin="dense"
                  maxLength={150}
                  style={{ width: "40%" }}
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.state")}
                  name="state"
                  error={touched.state && Boolean(errors.state)}
                  helperText={touched.state && errors.state}
                  variant="outlined"
                  margin="dense"
                  style={{ width: "20%" }}
                  maxLength={2}
                  className={classes.textField}
                />
              </div>
              <div className={classes.multFieldLine}>
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.latitude")}
                  name="latitude"
                  error={touched.latitude && Boolean(errors.latitude)}
                  helperText={touched.latitude && errors.latitude}
                  variant="outlined"
                  margin="dense"
                  style={{ width: "50%" }}
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("customerAddressModal.form.longitude")}
                  name="longitude"
                  error={touched.longitude && Boolean(errors.longitude)}
                  helperText={touched.longitude && errors.longitude}
                  variant="outlined"
                  margin="dense"
                  style={{ width: "50%" }}
                  className={classes.textField}
                />
              </div>
            </DialogContent>
            <DialogContent>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {i18n.t("customerAddress.table.isActive")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.type")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.zipCode")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.address")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.number")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.state")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.city")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.neighborhood")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("customerAddress.table.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRowSkeleton columns={9} />
                    ) : (
                      customersAddress.map(customerAddress => (
                        <TableRow key={customerAddress.id}>
                          <TableCell align="center">
                            {customerAddress.isActive ? (
                              <div className={classes.customTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            ) : (
                              <div className={classes.customTableCell}>
                                <Cancel style={{ color: red[500] }} />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{customerAddress.name}</TableCell>
                          <TableCell>{customerAddress.zipCode}</TableCell>
                          <TableCell>{customerAddress.address}</TableCell>
                          <TableCell>{customerAddress.number}</TableCell>
                          <TableCell>{customerAddress.state}</TableCell>
                          <TableCell>{customerAddress.city}</TableCell>
                          <TableCell>{customerAddress.neighborhood}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditContactAddress(customerAddress.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={e =>
                                handleDeleteContactAddress(customerAddress.id)
                              }
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="outlined"
              >
                Fechar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
                disabled={isSubmitting}
              >
                {customerAddress.id ? "Atualizar" : "Adicionar"}
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CustomerAddressModal;
