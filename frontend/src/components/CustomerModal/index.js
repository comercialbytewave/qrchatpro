import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  Avatar,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import { AttachMoney, Close } from "@material-ui/icons";
import moment from "moment";
import CustomerAddressModal from "../CustomerAddressModal";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1)
    }
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  colorAdorment: {
    width: 20,
    height: 20
  }
}));

const CustomerSchema = Yup.object().shape({
  fullName: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
  document: Yup.string()
    .required("Obrigatório")
    .test("valid-document", "Documento inválido", value => {
      const cleaned = value ? value.replace(/\D/g, "") : "";
      return cleaned.length === 11 || cleaned.length === 14;
    })
});

const CustomerModal = ({ open, onClose, customerId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    document: "",
    fullName: "",
    email: "",
    birthday: "",
    portifolioId: "",
    customerDefault: false
  };

  const [customer, setCustomer] = useState(initialState);
  const [contacts, setContacts] = useState([]);
  const [portifolios, setPortifolios] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerAddressModalOpen, setCustomertAddressModalOpen] =
    useState(false);

  useEffect(() => {
    try {
      (async () => {
        if (!customerId) return;

        const { data } = await api.get(`/customers/${customerId}`);
        setCustomer(prevState => {
          return {
            ...prevState,
            ...data,
            birthday: moment(data.birthday).format("YYYY-MM-DD")
          };
        });

        setContacts(data.contacts);
      })();
    } catch (err) {
      toastError(err);
    }
  }, [customerId, open]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await api.get(`/portifolios`);
      console.log(data);
      setPortifolios(data.portifolios);
    }
    fetchData();
  }, [open]);

  const handleClose = () => {
    setCustomer(initialState);
    onClose();
  };

  const handleRemoveContact = async contactId => {
    try {
      const { data } = await api.get(`/contacts/${contactId}`);
      data.customerId = null;
      await api.put(`/contacts/${contactId}`, data);
      toast.success(`Contato removido com sucesso!`);
    } catch (err) {
      toastError(err);
      handleClose();
    } finally {
      const { data } = await api.get(`/customers/${customerId}`);
      setCustomer(prevState => {
        return { ...prevState, ...data };
      });

      setContacts(data.contacts);
    }
  };

  const hadleEditCustomerAddress = customerId => {
    setSelectedCustomerId(customerId);
    setCustomertAddressModalOpen(true);
  };

  const handleCloseCustomertAddressModal = () => {
    setSelectedCustomerId(null);
    setCustomertAddressModalOpen(false);
  };

  const handleSaveCustomer = async values => {
    const cleanedDocument = values.document.replace(/\D/g, "");
    const customerData = {
      ...values,
      document: cleanedDocument,
      userId: user.id
    };

    try {
      if (customerId) {
        await api.put(`/customers/${customerId}`, customerData);
      } else {
        await api.post("/customers", customerData);
      }
      toast.success(`${i18n.t("customerModal.success")}`);
      if (typeof reload === "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <CustomerAddressModal
          aria-labelledby="form-dialog-title"
          customerId={selectedCustomerId}
          open={customerAddressModalOpen}
          onClose={handleCloseCustomertAddressModal}
        />
        <DialogTitle id="form-dialog-title">
          {customerId
            ? `${i18n.t("customerModal.title.edit")}`
            : `${i18n.t("customerModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={customer}
          enableReinitialize={true}
          validationSchema={CustomerSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCustomer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field name="document">
                    {({ field }) => {
                      const cleaned = field.value.replace(/\D/g, "");

                      // Aplica máscara manualmente
                      let displayValue = cleaned;
                      if (cleaned.length > 11) {
                        // CNPJ
                        displayValue = cleaned
                          .replace(/^(\d{2})(\d)/, "$1.$2")
                          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                          .replace(/\.(\d{3})(\d)/, ".$1/$2")
                          .replace(/(\d{4})(\d)/, "$1-$2");
                      } else if (cleaned.length > 3) {
                        // CPF
                        displayValue = cleaned
                          .replace(/^(\d{3})(\d)/, "$1.$2")
                          .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                          .replace(/\.(\d{3})(\d)/, ".$1-$2");
                      }

                      return (
                        <TextField
                          {...field}
                          value={displayValue}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, "");
                            if (raw.length <= 14) {
                              setCustomer(prev => ({ ...prev, document: raw }));
                            }
                          }}
                          label={i18n.t("customerModal.form.document")}
                          error={touched.document && Boolean(errors.document)}
                          helperText={touched.document && errors.document}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      );
                    }}
                  </Field>

                  <Field
                    as={TextField}
                    label={i18n.t("customerModal.form.name")}
                    name="fullName"
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                    variant="outlined"
                    margin="dense"
                    onChange={e =>
                      setCustomer(prev => ({
                        ...prev,
                        fullName: e.target.value
                      }))
                    }
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("customerModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    margin="dense"
                    onChange={e =>
                      setCustomer(prev => ({ ...prev, email: e.target.value }))
                    }
                    fullWidth
                  />
                  <FormControlLabel
                    fullWidth
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="customerDefault"
                        checked={values.customerDefault}
                        width="100%"
                        fullWidth
                      />
                    }
                    label={i18n.t("customerModal.form.customerDefault")}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("customerModal.form.birthday")}
                    type="date"
                    name="birthday"
                    InputLabelProps={{
                      shrink: true
                    }}
                    error={touched.birthday && Boolean(errors.birthday)}
                    helperText={touched.birthday && errors.birthday}
                    variant="outlined"
                    fullWidth
                  />

                  <FormControl margin="dense" variant="outlined" fullWidth>
                    <InputLabel htmlFor="user-selection">Carteira</InputLabel>
                    <Field
                      as={Select}
                      id="user-selection"
                      label="Carteira"
                      labelId="user-selection-label"
                      name="portifolioId"
                      margin="dense"
                      required
                    >
                      {portifolios.map((portifolio, key) => (
                        <MenuItem key={key} value={portifolio.id}>
                          {portifolio.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </div>

                <FormControl margin="dense" variant="outlined" fullWidth>
                  <div className={classes.divider}>
                    <span className={classes.dividerText}>Contatos</span>
                  </div>
                  <Paper className={classes.mainPaper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                          <TableCell align="center">
                            {i18n.t("contacts.table.whatsapp")}
                          </TableCell>
                          <TableCell align="center">
                            {i18n.t("contacts.table.email")}
                          </TableCell>
                          <TableCell align="center">
                            {i18n.t("contacts.table.actions")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <>
                          {contacts.map(contact => (
                            <TableRow key={contact.id}>
                              <TableCell style={{ paddingRight: 0 }}>
                                {<Avatar src={contact.profilePicUrl} />}
                              </TableCell>
                              <TableCell>{contact.name}</TableCell>
                              <TableCell align="center">
                                {contact.number}
                              </TableCell>
                              <TableCell align="center">
                                {contact.email}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleRemoveContact(contact.id)
                                  }
                                >
                                  <Close />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      </TableBody>
                    </Table>
                  </Paper>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => hadleEditCustomerAddress(customer.id)}
                  color="inherit"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("customerModal.buttons.address")}
                </Button>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("customerModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {customerId
                    ? `${i18n.t("customerModal.buttons.okEdit")}`
                    : `${i18n.t("customerModal.buttons.okAdd")}`}
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
    </div>
  );
};

export default CustomerModal;
