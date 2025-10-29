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
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import TableRowSkeleton from "../TableRowSkeleton";
import { Can } from "../Can";
import { AddCircle, Search } from "@material-ui/icons";
import useStores from "../../hooks/useStores";
import InputMask from "react-input-mask";
import NumberFormat from "react-number-format";
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

const ProductStoreModal = ({ open, onClose, productId }) => {
  const classes = useStyles();
  const { user: loggedInUser } = useContext(AuthContext);
  const [productStores, setProductStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const removeMask = value => {
    return value.replace(/[^0-9,]/g, "").replace(",", ".");
  };

  const initialState = {
    ean: "",
    name: "",
    code: "",
    description: "",
    isActive: false,
    categoryId: ""
  };

  const initialStateProductStore = {
    storeId: "",
    stock: 0,
    costPrice: 0,
    sellingPrice: 0,
    promotionPrice: 0,
    productId: productId
  };

  const [product, setProduct] = useState(initialState);
  const [productStore, setProductStore] = useState(initialStateProductStore);

  const { list: listStores } = useStores();

  useEffect(() => {
    if (!productId) return;
    const fetchProductStore = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/productStores/all/${productId}`);
        setProductStores(data.productStores);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(prevState => ({ ...prevState, ...data }));
      } catch (err) {
        toastError(err);
      }
    };
    fetchProduct();
    fetchProductStore();
    setProductStores(initialStateProductStore);
  }, [productId, open]);

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

  const handleAddProductStore = async values => {
  
    if (
      values.stock === 0 ||
      values.costPrice === 0 ||
      values.sellingPrice === 0
    ) {
      toast.error("Estoque, preço de custo e preço de venda são obrigatórios");
      return;
    }

    const storeData = {
      ...values,
      stock: removeMask(values.stock),
      costPrice: removeMask(values.costPrice),
      sellingPrice: removeMask(values.sellingPrice),
      promotionPrice:
        values.promotionPrice ? removeMask(values.promotionPrice) : 0,
      productId: productId
    };

    try {
      if (storeData.productId) {
        await api.post("/productStores", storeData);
      }
      const fetchProductStore = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/productStores/all/${productId}`);
          setProductStores(data.productStores);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProductStore();
      toast.success(`${i18n.t("productStoreModal.success")}`);
      setProductStores(initialStateProductStore);
    } catch (err) {
      toastError(err);
    }
    //  handleClose();
  };

  const handleClose = () => {
    setProductStores([]);
    onClose();
  };

  const handleDeleteProductStore = async productStoreId => {
    try {
      await api.delete(`/productStores/${productStoreId}`);
      toast.success(i18n.t("productStoreModal.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    const fetchProductStore = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/productStores/all/${productId}`);
        setProductStores(data.productStores);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    await fetchProductStore();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{product ? `${product.name}` : ""}</DialogTitle>
      <Formik
        initialValues={productStore}
        validationSchema={productStoreSchema}
        onSubmit={(values, actions) => {
          handleAddProductStore(values);
          actions.setSubmitting(false);
          actions.resetForm()
        }}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <div className={classes.multFieldLine}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                  style={{ width: "30%" }}
                >
                  <Can
                    role={loggedInUser.profile}
                    perform="user-modal:editProfile"
                    yes={() => (
                      <>
                        <InputLabel id="productStoreModal-selection-input-label">
                          {i18n.t("productStoreModal.form.storeId")}
                        </InputLabel>
                        <Field
                          as={Select}
                          name="storeId"
                          labelId="storeId-selection-label"
                          id="category-selection"
                          required
                          value={values.storeId}
                          onChange={e =>
                            setFieldValue("storeId", e.target.value)
                          }
                        >
                          <MenuItem value="">&nbsp;</MenuItem>
                          {stores.map(store => (
                            <MenuItem key={store.id} value={store.id}>
                              {store.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </>
                    )}
                  />
                </FormControl>
                <Field
                  as={TextField}
                  label={i18n.t("productStoreModal.form.stock")}
                  name="stock"
                  component={MaskedInput}
                  error={touched.stock && Boolean(errors.stock)}
                  helperText={touched.stock && errors.stock}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("productStoreModal.form.costPrice")}
                  name="costPrice"
                  component={CurrencyInput}
                  error={touched.costPrice && Boolean(errors.costPrice)}
                  helperText={touched.costPrice && errors.costPrice}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("productStoreModal.form.sellingPrice")}
                  name="sellingPrice"
                  component={CurrencyInput}
                  error={touched.sellingPrice && Boolean(errors.sellingPrice)}
                  helperText={touched.sellingPrice && errors.sellingPrice}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
                <Field
                  as={TextField}
                  label={i18n.t("productStoreModal.form.promotionPrice")}
                  name="promotionPrice"
                  component={CurrencyInput}
                  error={
                    touched.promotionPrice && Boolean(errors.promotionPrice)
                  }
                  helperText={touched.promotionPrice && errors.promotionPrice}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
              </div>

              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {i18n.t("productStores.table.storeId")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.productId")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.stock")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.costPrice")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.sellingPrice")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.promotionPrice")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("productStores.table.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRowSkeleton columns={2} />
                    ) : (
                      productStores.map(productStore => (
                        <TableRow key={productStore.id}>
                          <TableCell>{productStore.store?.name}</TableCell>
                          <TableCell>{productStore.product?.name}</TableCell>
                          <TableCell>{productStore.stock}</TableCell>
                          <TableCell>{productStore.costPrice}</TableCell>
                          <TableCell>{productStore.sellingPrice}</TableCell>
                          <TableCell>{productStore.promotionPrice}</TableCell>
                          <TableCell>
                            
                            <IconButton
                              size="small"
                              onClick={e =>
                                handleDeleteProductStore(productStore.id)
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

export default ProductStoreModal;
