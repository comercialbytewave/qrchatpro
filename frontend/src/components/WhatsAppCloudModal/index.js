import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Box,
  Link
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    marginTop: 12,
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  infoBox: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
}));

const WhatsAppCloudSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  token: Yup.string()
    .required("Token é obrigatório"),
  phoneNumberId: Yup.string()
    .required("Phone Number ID é obrigatório"),
});

const WhatsAppCloudModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    name: "",
    token: "",
    phoneNumberId: "",
    isDefault: false,
    greetingMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    queueIds: [],
  };

  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (whatsAppId) {
      const fetchWhatsApp = async () => {
        try {
          const { data } = await api.get(`/whatsapp-cloud/${whatsAppId}`);
          setWhatsApp(data);
          if (data.queues) {
            setSelectedQueueIds(data.queues.map((q) => q.id));
          }
        } catch (err) {
          toastError(err);
        }
      };
      fetchWhatsApp();
    } else {
      setWhatsApp(initialState);
      setSelectedQueueIds([]);
    }
  }, [whatsAppId, open]);

  const handleClose = () => {
    setWhatsApp(initialState);
    setSelectedQueueIds([]);
    onClose();
  };

  const handleSaveWhatsApp = async (values) => {
    setLoading(true);
    try {
      const whatsappData = {
        ...values,
        queueIds: selectedQueueIds,
        channel: "whatsapp-cloud",
      };

      if (whatsAppId) {
        await api.put(`/whatsapp-cloud/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp-cloud", whatsappData);
      }

      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {whatsAppId
          ? i18n.t("whatsappModal.title.edit")
          : "Nova Conexão WhatsApp Cloud API"}
      </DialogTitle>
      <Formik
        initialValues={whatsApp}
        enableReinitialize={true}
        validationSchema={WhatsAppCloudSchema}
        onSubmit={(values) => {
          handleSaveWhatsApp(values);
        }}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <Box className={classes.infoBox}>
                <Typography variant="body2" gutterBottom>
                  <strong>Informações sobre WhatsApp Cloud API:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Você precisa ter uma conta no Facebook Business</li>
                    <li>Obtenha o Token de Acesso e Phone Number ID no painel do Meta</li>
                    <li>
                      <Link
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Documentação oficial
                      </Link>
                    </li>
                  </ul>
                </Typography>
              </Box>

              <Grid spacing={2} container>
                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.name")}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label="Token de Acesso"
                    name="token"
                    type="password"
                    error={touched.token && Boolean(errors.token)}
                    helperText={
                      touched.token && errors.token
                        ? errors.token
                        : "Token de acesso da API do WhatsApp"
                    }
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label="Phone Number ID"
                    name="phoneNumberId"
                    error={touched.phoneNumberId && Boolean(errors.phoneNumberId)}
                    helperText={
                      touched.phoneNumberId && errors.phoneNumberId
                        ? errors.phoneNumberId
                        : "ID do número de telefone no WhatsApp Business"
                    }
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.greetingMessage")}
                    name="greetingMessage"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.complationMessage")}
                    name="complationMessage"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.outOfHoursMessage")}
                    name="outOfHoursMessage"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>

                <Grid xs={12} item>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isDefault}
                        onChange={(e) =>
                          setFieldValue("isDefault", e.target.checked)
                        }
                        name="isDefault"
                        color="primary"
                      />
                    }
                    label={i18n.t("whatsappModal.form.isDefault")}
                  />
                </Grid>

                <Grid xs={12} item>
                  <QueueSelect
                    selectedQueueIds={selectedQueueIds}
                    onChange={(values) => setSelectedQueueIds(values)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={loading}
                variant="outlined"
              >
                {i18n.t("whatsappModal.buttons.cancel")}
              </Button>
              <div className={classes.btnWrapper}>
                <Button
                  type="submit"
                  color="primary"
                  disabled={loading}
                  variant="contained"
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default WhatsAppCloudModal;


