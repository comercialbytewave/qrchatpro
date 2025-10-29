import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { head } from "lodash";
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
import usePlans from "../../hooks/usePlans";
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";
import useUsers from "../../hooks/useUsers";
import { FlipCameraAndroid, Search } from "@material-ui/icons";

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
  imagePreview: {
    maxWidth: "100px", // Define o tamanho máximo da imagem
    maxHeight: "100px", // Define o tamanho máximo da imagem
    display: "block",
    margin: "10px auto",
    borderRadius: "5px"
  }
}));

const phoneRegExp = /^(\(\d{2}\) \d{4,5}-\d{4})$/;

const CompanySchema = Yup.object().shape({
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório"),
 
});

const EnterpriseModal = ({ open, onClose, companyId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const { list: listPlans } = usePlans();
  const { list: listUsers } = useUsers();
  const initialState = {
    name: "",
    phone: "",
    email: "",
    planId: "",
    mediaPath: "",
    mediaName: "",
    token: ""    
  };
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [company, setCompany] = useState(initialState);
  const attachmentFile = useRef(null);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (!companyId) return;

    (async () => {
      try {
        const { data } = await api.get(`/companies/${companyId}`);
        setCompany(prevState => ({ ...prevState, ...data }));
      } catch (err) {
        toastError(err);
      }
    })();
  }, [companyId, open]);

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setCompany(initialState);
    onClose();
  };

  const handleAttachmentFile = e => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onload = event => {
        setCompany(prevState => ({
          ...prevState,
          mediaPath: event.target.result // Define a pré-visualização da imagem
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = async values => {
    const companyData = { ...values };
    try {
      if (companyId) {
        await api.put(`/companies/${companyId}/schedules`, companyData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/companies/${companyId}/media-upload`, formData);
        }
      } else {
        toastError("Não é permitido gravar uma empresa sem id");
      }
      setAttachment(null);
      toast.success(`${i18n.t("companyModal.success")}`);
      if (typeof reload === "function") reload();
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleGenarionCompany = async values => {
    const companyData = { ...values };
    try {
      if (companyId) {
        const { data } =  await api.put(`/companies/token/${companyId}`, companyData);        
        setCompany(data);

      } else {
        toastError("Não é permitido gravar uma empresa sem id");
      }
      toast.success(`${i18n.t("companyModal.success")}`);
      //if (typeof reload === "function") reload();
    } catch (err) {
      toastError(err);
    }
    //handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {companyId
            ? i18n.t("companyModal.title.edit")
            : i18n.t("companyModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={company}
          enableReinitialize={true}
          validationSchema={CompanySchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCompany(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, handleChange }) => (
            <Form>
              <DialogContent dividers>
                {company.mediaPath && (
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
                <Field
                  as={TextField}
                  label={i18n.t("companyModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  disabled
                  fullWidth
                />
                <InputMask
                  mask="(99) 99999-9999"
                  value={values.phone}
                  onChange={handleChange}
                  disabled
                >
                  {() => (
                    <TextField
                      label={i18n.t("companyModal.form.phone")}
                      name="phone"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  )}
                </InputMask>
                <Field
                  as={TextField}
                  label={i18n.t("companyModal.form.email")}
                  name="email"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  disabled
                />
                <div className={classes.multFieldLine}>

                  <Field
                    as={TextField}
                    label={i18n.t("companyModal.form.token")}
                    name="token"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                  <IconButton
                    variant="contained"
                    color="primary"
                    aria-label="add to shopping cart"
                    onClick={() => handleGenarionCompany(values)
                    }
                  >
                    <FlipCameraAndroid />
                  </IconButton>
                </div>

                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label="Plano"
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                    fullWidth
                    disabled
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name} - Atendentes: {plan.users} - WhatsApp:{" "}
                        {plan.connections} - Filas: {plan.queues} - R${" "}
                        {plan.value}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
               
                <div style={{ display: "none" }}>
                  <input
                    type="file"
                     accept=".png,.jpg,.jpeg"
                    ref={attachmentFile}
                    inputProps={{ accept: "image/*" }}
                    onChange={e => handleAttachmentFile(e)}
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
                  {i18n.t("companyModal.buttons.attach")}
                </Button>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("companyModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                >
                  {companyId
                    ? i18n.t("companyModal.buttons.okEdit")
                    : i18n.t("companyModal.buttons.okAdd")}
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

export default EnterpriseModal;
