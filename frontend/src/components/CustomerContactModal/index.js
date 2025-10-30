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
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";
import CustomerAddressModal from "../../components/CustomerAddressModal";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Search } from "@material-ui/icons";

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

const TagSchema = Yup.object().shape({
  fullName: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
  document: Yup.string()
    .required("Obrigatório")
    .test("valid-document", "Documento inválido", value => {
      const cleaned = value ? value.replace(/\D/g, "") : "";
      return cleaned.length === 11 || cleaned.length === 14;
    })
});

const CustomerContactModal = ({ open, onClose, contactId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    document: "",
    fullName: "",
    email: "",
    portfolioId: ""
  };

  const [isCustomerEnable, setIsCustomerEnable] = useState(false);
  const [contact, setContact] = useState(null);
  const [customer, setCustomer] = useState(initialState);
  const [portfolios, setPortfolios] = useState([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerAddressModalOpen, setCustomertAddressModalOpen] =
    useState(false);

  useEffect(() => {
    try {
      (async () => {
        if (contactId) {
          const { data } = await api.get(`/contacts/${contactId}`);
          setContact(data);

          if (!contact?.customerId) return;
          const customerData = await api.get(
            `/customers/${contact.customerId}`
          );
          setCustomer(customerData.data);
        }
      })();
    } catch (err) {
      toastError(err);
    }
  }, [contactId, open]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await api.get(`/portfolios`);
      setPortfolios(data.portfolios);
    }
    fetchData();
  }, []);

  const handleClose = () => {
    setCustomer(initialState);
    onClose();
  };

  const hadleEditCustomerAddress = customerId => {
    setSelectedCustomerId(customerId);
    setCustomertAddressModalOpen(true);
  };

  const handleCloseCustomertAddressModal = () => {
    setSelectedCustomerId(null);
    setCustomertAddressModalOpen(false);
  };

  const handleSearchCustomer = async (document, setFieldValue) => {
    
    const cpfOrCnpj = document.replace(/\D/g, "")
    if (!cpfOrCnpj || ( cpfOrCnpj.length < 11 || cpfOrCnpj.length > 14) ) return;
    try {
      const customer = await api.get(
        `/customers/search/${cpfOrCnpj}`
      );

      setIsCustomerEnable(true);
      if (!customer) {
        toast.error("Ops! Documento não encontrado.");
        return;
      }

      setCustomer(customer.data);
      setFieldValue("id", customer.data.id);
      setFieldValue("document", customer.data.document);
      setFieldValue("fullName", customer.data.fullName);
      setFieldValue("email", customer.data.email);
      setFieldValue("portfolioId", customer.data.portfolioId);
    } catch (error) {
      console.error("Erro ao buscar Documento", error);
      toast.error("Ops! Documento não encontrado");
    }
  };

  const handleSaveCustomer = async values => {
    const customerData = {
      ...values,
      document: values.document.replace(/\D/g, ""),
      userId: user.id
    };

    try {
      if (contact.customerId) {
        await api.put(`/customers/${contact.customerId}`, customerData);
        if (contactId) {
          await api.put(`/contacts/${contactId}`, {
            email: customerData.email,
            number: contact.number,
            customerId: contact.customerId
          });
        }
      } else {
        await api.post("/customers", customerData).then(async res => {
          const customer = { ...res.data };
          if (contact.id && contactId) {
            await api.put(`/contacts/${contactId}`, {
              email: customerData.email,
              number: contact.number,
              customerId: customer.id
            });
          }
        });
      }

      toast.success(`${i18n.t("customerModal.success")}`);
      if (typeof reload === "function") {
        reload();
      }
      window.location.reload();
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <CustomerAddressModal
        aria-labelledby="form-dialog-title"
        customerId={selectedCustomerId}
        open={customerAddressModalOpen}
        onClose={handleCloseCustomertAddressModal}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {contactId && ConstantSourceNode.customerId
            ? `${i18n.t("customerModal.title.edit")}`
            : `${i18n.t("customerModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={customer}
          enableReinitialize
          validationSchema={TagSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCustomer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
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
                  <IconButton
                    variant="contained"
                    color="primary"
                    aria-label="add to shopping cart"
                    onClick={() =>
                      handleSearchCustomer(values.document, setFieldValue)
                    }
                  >
                    <Search />
                  </IconButton>
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("customerModal.form.name")}
                  name="fullName"
                  error={touched.fullName && Boolean(errors.fullName)}
                  helperText={touched.fullName && errors.fullName}
                  variant="outlined"
                  margin="dense"
                  onChange={e =>
                    setCustomer(prev => ({ ...prev, fullName: e.target.value }))
                  }
                  fullWidth
                  disabled={isCustomerEnable ? false : true}
                />

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
                  disabled={isCustomerEnable ? false : true}
                />

                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="user-selection">Carteira</InputLabel>
                  <Field
                    as={Select}
                    id="user-selection"
                    label="Carteira"
                    labelId="user-selection-label"
                    name="portfolioId"
                    margin="dense"
                    required
                   // disabled={customer.id}
                    fullWidth
                    disabled={isCustomerEnable ? false : true}
                  >
                    {portfolios.map((portfolio, key) => (
                      <MenuItem key={key} value={portfolio.id}>
                        {portfolio.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  onClick={() => hadleEditCustomerAddress(customer.id)}
                  disabled={customer.id ? false : true}
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
                  {contact?.customerId
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

export default CustomerContactModal;
