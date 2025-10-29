import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputMask from "react-input-mask";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FormControlLabel, IconButton, Switch } from "@material-ui/core";
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

const storeSchema = Yup.object().shape({
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório")
});

const StoreModal = ({ open, onClose, storeId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    document: "",
    name: "",
    fantasy: "",
    zipCode: "",
    address: "",
    number: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    isActive: false
  };

  const [store, setStore] = useState(initialState);

  useEffect(() => {
    try {
      (async () => {
        if (!storeId) return;

        const { data } = await api.get(`/stores/${storeId}`);
        setStore(prevState => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [storeId, open]);

  const handleClose = () => {
    setStore(initialState);
    onClose();
  };

  const handleSaveStore = async values => {
    const storeData = {
      ...values,
      userId: user.id,
      document: values.document.replace(/\D/g, ""),
      zipCode: values.zipCode.replace(/\D/g, "")
    };

    try {
      if (storeId) {
        await api.put(`/stores/${storeId}`, storeData);
      } else {
        await api.post("/stores", storeData);
      }
      toast.success(`${i18n.t("storeModal.success")}`);
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleSearchZipCode = async (zipCode, setFieldValue) => {
    console.log("CEP digitado:", zipCode); // Depuração

    if (!zipCode || zipCode.length < 8) {
      console.error("CEP inválido:", zipCode);
      return;
    }

    try {
      /*const response = await fetch(
        `https://viacep.com.br/ws/${zipCode.replace(/\D/g, "")}/json/`
      );*/

      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${zipCode.replace(/\D/g, "")}`
      );

      const data = await response.json();
      console.log("CEP encontrado:", data);
      if (!data.erro) {
        setFieldValue("address", data.street || "");
        setFieldValue("neighborhood", data.neighborhood || "");
        setFieldValue("city", data.city || "");
        setFieldValue("state", data.state || "");
        setFieldValue("longitude", data?.location?.coordinates.longitude || "");
        setFieldValue("latitude", data?.location.coordinates.latitude || "");
      } else {
        console.error("CEP não encontrado.");
      }
     
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {storeId
            ? `${i18n.t("storeModal.title.edit")}`
            : `${i18n.t("storeModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={store}
          enableReinitialize={true}
          validationSchema={storeSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveStore(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field name="document">
                    {({ field, form }) => (
                      <InputMask
                        {...field}
                        mask="99.999.999/9999-99"
                        maskChar="_"
                        value={field.value}
                        onChange={e =>
                          form.setFieldValue("document", e.target.value)
                        }
                      >
                        {inputProps => (
                          <TextField
                            {...inputProps}
                            label="CNPJ"
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            error={touched.document && Boolean(errors.document)}
                            helperText={touched.document && errors.document}
                          />
                        )}
                      </InputMask>
                    )}
                  </Field>
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isActive"
                        checked={values.isActive}
                      />
                    }
                    label={i18n.t("storeModal.form.isActive")}
                  />
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("storeModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  maxLength={160}
                  fullWidth
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("storeModal.form.fantasy")}
                  name="fantasy"
                  error={touched.fantasy && Boolean(errors.fantasy)}
                  helperText={touched.fantasy && errors.fantasy}
                  variant="outlined"
                  margin="dense"
                  maxLength={60}
                  fullWidth
                  className={classes.textField}
                />
               
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
                            fullWidth
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
                    label={i18n.t("storeModal.form.address")}
                    name="address"
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    maxLength={250}
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("storeModal.form.number")}
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
                  label={i18n.t("storeModal.form.complement")}
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
                    label={i18n.t("storeModal.form.neighborhood")}
                    name="neighborhood"
                    error={touched.neighborhood && Boolean(errors.neighborhood)}
                    helperText={touched.neighborhood && errors.neighborhood}
                    variant="outlined"
                    margin="dense"
                    maxLength={150}
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("storeModal.form.city")}
                    name="city"
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                    variant="outlined"
                    margin="dense"
                    maxLength={150}
                    className={classes.textField}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("storeModal.form.state")}
                    name="state"
                    error={touched.state && Boolean(errors.state)}
                    helperText={touched.state && errors.state}
                    variant="outlined"
                    margin="dense"
                    maxLength={2}
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("storeModal.form.latitude")}
                    name="latitude"
                    error={touched.latitude && Boolean(errors.latitude)}
                    helperText={touched.latitude && errors.latitude}
                    variant="outlined"
                    margin="dense"
                    style={{ width: "45%" }}
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("storeModal.form.longitude")}
                    name="longitude"
                    error={touched.longitude && Boolean(errors.longitude)}
                    helperText={touched.longitude && errors.longitude}
                    variant="outlined"
                    margin="dense"
                    style={{ width: "45%" }}
                    className={classes.textField}
                  />
                </div>
               
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("storeModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {storeId
                    ? `${i18n.t("storeModal.buttons.okEdit")}`
                    : `${i18n.t("storeModal.buttons.okAdd")}`}
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

export default StoreModal;
