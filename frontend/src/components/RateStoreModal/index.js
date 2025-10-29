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
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import TableRowSkeleton from "../TableRowSkeleton";
import { Can } from "../Can";
import { AddCircle, Cancel, CheckCircle, Search } from "@material-ui/icons";
import useStores from "../../hooks/useStores";
import InputMask from "react-input-mask";
import NumberFormat from "react-number-format";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";

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
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1)
    }
  },
  tabPanelsContainer: {
    padding: theme.spacing(2)
  }
}));

const productStoreSchema = Yup.object().shape({
  stock: Yup.string().required("Estoque é obrigatório"),
  costPrice: Yup.string().required("Preço de custo é obrigatório"),
  sellingPrice: Yup.string().required("Preço de venda é obrigatório"),
  promotionPrice: Yup.string().required("Preço promocional é obrigatório")
});

const MaskedInput = ({ field, form, ...props }) => (
  <NumberFormat
    {...field}
    {...props}
    thousandSeparator={"."}
    decimalSeparator={","}
    prefix={""}
    decimalScale={2}
    fixedDecimalScale
    customInput={TextField}
  />
);

const CurrencyInput = ({ field, form, ...props }) => (
  <NumberFormat
    {...field}
    {...props}
    thousandSeparator={"."}
    decimalSeparator={","}
    prefix={"R$ "}
    decimalScale={2}
    fixedDecimalScale
    customInput={TextField}
  />
);

const RateStoreModal = ({ open, onClose, storeId }) => {
  const classes = useStyles();
  const { user: loggedInUser } = useContext(AuthContext);

  const [rateStores, setRateStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [settingRate, setSettingRate] = useState([]);
  const [loading, setLoading] = useState(false);

  const [setting, setSetting] = useState([]);
  const [typeRate, setTypeRate] = useState([]);
  const [activeAdd, setActiveAdd] = useState(false);

  const removeMask = value => {
    return value.replace(/[^0-9,]/g, "").replace(",", ".");
  };

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

  const initialStateRateStore = {
    storeId: "",
    type: settingRate,
    kilometers: "",
    minimumValue: "",
    value: "",
    isActive: true
  };

  const [store, setStore] = useState(initialState);
  const [rateStore, setRateStore] = useState(initialStateRateStore);

  const { list: listStores } = useStores();

  useEffect(() => {
    if (!storeId) return;
    const fetchRateStore = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/rates/store/${storeId}`);
        setRateStores(data.rates);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchStore = async () => {
      try {
        const { data } = await api.get(`/stores/${storeId}`);
        setStore(prevState => ({ ...prevState, ...data }));
      } catch (err) {
        toastError(err);
      }
    };
    fetchStore();
    fetchRateStore();
    setRateStores(initialStateRateStore);
  }, [storeId, open]);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const deliveryMethods = data.find(d => d.key === "deliveryMethods");
        if (deliveryMethods) {
          const typeRate =
            deliveryMethods.value === "fixeRate"
              ? "Taxa Fixa"
              : deliveryMethods.value === "byValue"
              ? "Pr Valor"
              : deliveryMethods.value === "byKm"
              ? "Por Quilometragem"
              : "Não Entregamos ou Por Zona/Bairro";

          const addButton =
            deliveryMethods.value.includes("notDelivery") ||
            deliveryMethods.value.includes("byZone");
          setActiveAdd(addButton);
          setTypeRate(typeRate);
          setSetting(deliveryMethods.value);
        }
      }
    });
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const list = await listStores();
        setStores(list);
      } catch (err) {
        toastError(err);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const deliveryMethods = data.find(d => d.key === "deliveryMethods");
        if (deliveryMethods) {
          setSettingRate(deliveryMethods.value);
        }
      }
    });
  }, []);

  const handleAddRateStore = async values => {};

  const handleClose = () => {
    setRateStores([]);
    onClose();
  };

  const handleDeleteProductStore = async productStoreId => {};

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{store ? `Taxa de Entrega - ${store.name}` : ""}</DialogTitle>
      <Formik
        initialValues={rateStore}
        validationSchema={productStoreSchema}
        onSubmit={(values, actions) => {
          handleAddRateStore(values);
          actions.setSubmitting(false);
          actions.resetForm();
        }}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <div className={classes.multFieldLine}>
                <FormControl variant="outlined" margin="dense" fullWidth>
                  <InputLabel id="rateModal-label">
                    {i18n.t("rateModal.form.type")}
                  </InputLabel>
                  <Select
                    labelId="rateModal-label"
                    value={settingRate}
                    disabled
                  >
                    <MenuItem value={"notDelivery"}>Não Entregamos</MenuItem>
                    <MenuItem value={"fixeRate"}>Taxa Fixa</MenuItem>
                    <MenuItem value={"byValue"}>Por Valor</MenuItem>
                    <MenuItem value={"byKm"}>Por KM</MenuItem>
                    <MenuItem value={"byZone"}>Por Zona/Bairro</MenuItem>
                  </Select>
                </FormControl>

                {settingRate === "byKm" ? (
                  <Field
                    as={TextField}
                    label={i18n.t("rateModal.form.kilometers")}
                    name="kilometers"
                    component={MaskedInput}
                    error={touched.kilometers && Boolean(errors.kilometers)}
                    helperText={touched.kilometers && errors.kilometers}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                  />
                ) : null}

                {settingRate === "byKm" || settingRate === "byValue" ? (
                  <Field
                    as={TextField}
                    label={i18n.t("rateModal.form.minimumValue")}
                    name="minimumValue"
                    component={CurrencyInput}
                    error={touched.minimumValue && Boolean(errors.minimumValue)}
                    helperText={touched.minimumValue && errors.minimumValue}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                  />
                ) : null}
                <Field
                  as={TextField}
                  label={i18n.t("rateModal.form.value")}
                  name="value"
                  component={CurrencyInput}
                  error={touched.value && Boolean(errors.value)}
                  helperText={touched.value && errors.value}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </div>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        {i18n.t("rates.table.store")}
                      </TableCell>
                      {setting === "byKm" ? (
                        <TableCell align="center">
                          {i18n.t("rates.table.kilometers")}
                        </TableCell>
                      ) : null}
                      {setting != "fixeRate" ? (
                        <TableCell align="center">
                          {i18n.t("rates.table.minimumValue")}
                        </TableCell>
                      ) : null}
                      <TableCell align="center">
                        {i18n.t("rates.table.value")}
                      </TableCell>
                      <TableCell align="center">
                        {i18n.t("rates.table.isActive")}
                      </TableCell>
                      <TableCell align="center">
                        {i18n.t("rates.table.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRowSkeleton columns={2} />
                    ) : (
                      rateStores.map(rate => (
                        <TableRow key={rate.id}>
                          <TableCell align="center">
                            {rate.store.name}
                          </TableCell>
                          {setting === "byKm" ? (
                            <TableCell align="center">
                              {rate.kilometers}
                            </TableCell>
                          ) : null}
                          {setting != "fixeRate" ? (
                            <TableCell align="center">
                              {rate.minimumValue}
                            </TableCell>
                          ) : null}
                          <TableCell align="center">{rate.value}</TableCell>
                          <TableCell align="center">
                            {rate.isActive ? (
                              <div className={classes.customTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            ) : (
                              <div className={classes.customTableCell}>
                                <Cancel style={{ color: red[500] }} />
                              </div>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => {}}>
                              <EditIcon />
                            </IconButton>

                            <IconButton size="small" onClick={e => {}}>
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
              >
                Adicionar
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

export default RateStoreModal;
