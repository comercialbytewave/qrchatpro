/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { head } from "lodash";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCategories from "../../hooks/useCategories";
import { Can } from "../Can";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const useStyles = makeStyles(theme => ({
  root: { display: "flex", flexWrap: "wrap" },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": { marginRight: theme.spacing(1) }
  },
  btnWrapper: { position: "relative" },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  imagePreview: {
    maxWidth: "100px", // Define o tamanho máximo da imagem
    maxHeight: "100px", // Define o tamanho máximo da imagem
    display: "block",
    margin: "10px auto",
    borderRadius: "5px"
  }
}));

const productSchema = Yup.object().shape({
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório")
});

const ProductModal = ({ open, onClose, productId, reload }) => {
  const classes = useStyles();
  const { user: loggedInUser } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const { list: listCategories } = useCategories();
  const attachmentFile = useRef(null);

  const [attachment, setAttachment] = useState(null);

  const initialState = {
    ean: "",
    name: "",
    code: "",
    description: "",
    isActive: false,
    categoryId: ""
   
  };

  const [product, setProduct] = useState(initialState);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(prevState => ({ ...prevState, ...data }));
      } catch (err) {
        toastError(err);
      }
    };
    fetchProduct();
  }, [productId, open]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await listCategories();
        setCategories(list);
      } catch (err) {
        toastError(err);
      }
    };
    fetchCategories();
  }, []);

  const handleAttachmentFile = (e, setFieldValue) => {
    const file = head(e.target.files);
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(
          `O arquivo é muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE_MB}MB`
        );
        return;
      }

      setAttachment(file);

      const reader = new FileReader();
      reader.onload = event => {
        const mediaPath = event.target.result;

        // NÃO usa setProduct aqui, para não resetar o Formik
        setFieldValue("mediaName", file.name);
        setFieldValue("mediaPath", mediaPath);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setProduct(initialState);
    setAttachment(null);
    onClose();
  };

  const handleSaveProduct = async values => {
		const productData = { ...values, userId: loggedInUser.id };
		try {
			if (productId) {
				await api.put(`/products/${productId}`, productData);
				if (attachment != null) {
					const formData = new FormData();
					formData.append("file", attachment);
					await api.post(
						`/products/${productId}/media-upload`,
						formData
					);
				}
			} else {
				const { data } = await api.post("/products", productData);
				if (attachment != null) {
					const formData = new FormData();
					formData.append("file", attachment);
					await api.post(`/products/${data.id}/media-upload`, formData);
				}
			}
			toast.success(i18n.t("productModal.success"));
			if (typeof reload == 'function') {
				reload();
			}
			
		} catch (err) {
			toastError(err);
		}
    setAttachment(null); // limp
		setProduct(initialState);
		handleClose();
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
          {productId
            ? i18n.t("productModal.title.edit")
            : i18n.t("productModal.title.add")}
        </DialogTitle>

        <Formik
          initialValues={product}
          enableReinitialize
          validationSchema={productSchema}
          onSubmit={(values, actions) => {
            handleSaveProduct(values, actions);
            actions.setSubmitting(false);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                {product.mediaPath && (
                  <img
                    src={
                      attachment
                        ? values.mediaPath // Exibir a pré-visualização se houver imagem anexada
                        : `${process.env.REACT_APP_BACKEND_URL}/public/${values.mediaPath}`
                    }
                    alt="Preview"
                    className={classes.imagePreview}
                  />
                )}
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("productModal.form.ean")}
                    autoFocus
                    name="ean"
                    error={touched.ean && Boolean(errors.ean)}
                    helperText={touched.ean && errors.ean}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
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
                    label={i18n.t("productModal.form.isActive")}
                  />
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("productModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
                <Field
                  as={TextField}
                  label={i18n.t("productModal.form.code")}
                  name="code"
                  error={touched.code && Boolean(errors.code)}
                  helperText={touched.code && errors.code}
                  variant="outlined"
                  margin="dense"
                  style={{ width: "40%" }}
                  className={classes.textField}
                />
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                >
                  <Can
                    role={loggedInUser.profile}
                    perform="user-modal:editProfile"
                    yes={() => (
                      <>
                        <InputLabel id="productModal-selection-input-label">
                          {i18n.t("productModal.form.categoryId")}
                        </InputLabel>
                        <Field
                          as={Select}
                          name="categoryId"
                          labelId="category-selection-label"
                          id="category-selection"
                          required
                          value={values.categoryId}
                          onChange={e =>
                            setFieldValue("categoryId", e.target.value)
                          }
                        >
                          <MenuItem value="">&nbsp;</MenuItem>
                          {categories.map(category => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </>
                    )}
                  />
                </FormControl>
                <Field
                  as={TextField}
                  label={i18n.t("productModal.form.description")}
                  type="text"
                  name="description"
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  variant="outlined"
                  margin="dense"
                  rows={5}
                  fullWidth
                  multiline
                  className={classes.textField}
                />

                <div style={{ display: "none" }}>
                  <input
                    type="file"
                     accept=".png,.jpg,.jpeg"
                    ref={attachmentFile}
                    inputProps={{ accept: "image/*" }}
                    onChange={e => handleAttachmentFile(e, setFieldValue)}
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  onClick={() => attachmentFile.current.click()}
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("products.buttons.attach")}
                </Button>

                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("productModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {productId
                    ? i18n.t("productModal.buttons.okEdit")
                    : i18n.t("productModal.buttons.okAdd")}
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

export default ProductModal;
